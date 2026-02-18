#!/usr/bin/env python3
"""
Parse Feature_Spec.md and convert to features.json following Anthropic guidelines.
"""

import json
import re
from typing import List, Dict, Any

def categorize_feature(section_name: str, subsection_name: str, description: str) -> str:
    """Determine the category based on section, subsection, and description."""
    section_lower = section_name.lower()
    subsection_lower = subsection_name.lower()
    desc_lower = description.lower()

    # Integration indicators (be more specific)
    if 'integration' in section_lower and 'api' in section_lower:
        return 'integration'
    if any(keyword in subsection_lower for keyword in ['api', 'webhook', 'zapier', 'integration']):
        # But exclude workspace/SSO which are security features
        if not any(keyword in subsection_lower for keyword in ['workspace', 'sso', 'owner', 'admin']):
            return 'integration'
    if any(keyword in desc_lower for keyword in ['api', 'webhook', 'third-party', 'programmatic access']):
        return 'integration'

    # Security indicators (check before workspace management)
    if any(keyword in section_lower for keyword in ['role', 'permission', 'security', 'authentication']):
        return 'security'
    if any(keyword in subsection_lower for keyword in ['role', 'permission', 'auth', 'pin', 'access control', 'security', 'owner', 'admin', 'manager', 'user group', 'invite', 'deactivate']):
        return 'security'
    if any(keyword in desc_lower for keyword in ['authentication', 'authorization', 'permission', 'access', 'role', 'security', 'pin', 'password']):
        return 'security'

    # Performance indicators
    if any(keyword in subsection_lower for keyword in ['offline', 'sync', 'cache', 'performance']):
        return 'performance'
    if any(keyword in desc_lower for keyword in ['offline', 'sync', 'cache', 'performance', 'optimization']):
        return 'performance'

    # UI indicators
    if any(keyword in subsection_lower for keyword in ['view', 'dashboard', 'interface', 'layout', 'calendar', 'timesheet', 'customization', 'design']):
        return 'ui'
    if any(keyword in desc_lower for keyword in ['visual', 'display', 'view', 'interface', 'layout', 'dashboard', 'widget']):
        return 'ui'

    # Default to functional
    return 'functional'

def clean_description(text: str) -> str:
    """Clean up description text."""
    text = text.strip()
    # Remove markdown formatting
    text = re.sub(r'\*\*', '', text)
    text = re.sub(r'`', '', text)
    return text

def extract_steps(content: str, feature_name: str) -> List[str]:
    """Extract actionable steps from the feature content."""
    steps = []

    # Extract from User Actions section
    actions_match = re.search(r'####\s*User Actions\s*\n(.*?)(?=####|\n###|\Z)', content, re.DOTALL | re.IGNORECASE)
    if actions_match:
        actions_text = actions_match.group(1)
        # Extract bullet points
        action_items = re.findall(r'^\s*[-*]\s+(.+)$', actions_text, re.MULTILINE)
        for action in action_items[:3]:  # Get first 3 actions
            clean_action = clean_description(action)
            if not clean_action.startswith(('Navigate', 'Click', 'Select', 'Enter', 'View', 'Check', 'Verify')):
                # Add action verb
                clean_action = f"Execute action: {clean_action}"
            steps.append(clean_action)

    # Extract from UI States section
    ui_match = re.search(r'####\s*UI States\s*\n(.*?)(?=####|\n###|\Z)', content, re.DOTALL | re.IGNORECASE)
    if ui_match:
        ui_text = ui_match.group(1)
        ui_items = re.findall(r'^\s*[-*]\s+\*\*([^:*]+)\*\*[:\s]*(.+)$', ui_text, re.MULTILINE)
        for state, desc in ui_items[:2]:  # Get first 2 UI states
            clean_state = clean_description(state)
            clean_desc = clean_description(desc)
            steps.append(f"Verify {clean_state} displays: {clean_desc[:80]}")

    # Extract from Feedback Messages section
    feedback_match = re.search(r'####\s*Feedback Messages\s*\n(.*?)(?=####|\n###|\Z)', content, re.DOTALL | re.IGNORECASE)
    if feedback_match:
        feedback_text = feedback_match.group(1)
        feedback_items = re.findall(r'^\s*[-*]\s+"([^"]+)"', feedback_text, re.MULTILINE)
        if feedback_items:
            steps.append(f"Confirm message appears: \"{feedback_items[0][:80]}\"")

    # If we don't have enough steps, add generic ones
    if len(steps) < 3:
        steps.insert(0, f"Navigate to {feature_name} feature")
        if len(steps) < 4:
            steps.append(f"Test {feature_name} functionality")

    # Ensure we have between 3-7 steps
    steps = steps[:7]
    while len(steps) < 3:
        steps.append(f"Verify {feature_name} works as expected")

    return steps

def parse_markdown_file(filepath: str) -> List[Dict[str, Any]]:
    """Parse the Feature_Spec.md file and extract features."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    features = []

    # Split by main sections (# headers)
    main_sections = re.split(r'\n# ', content)

    for main_section in main_sections[1:]:  # Skip TOC section
        lines = main_section.split('\n')
        section_title = lines[0].strip()

        # Skip if not a feature section
        if section_title.lower() in ['clockify feature specification', 'table of contents']:
            continue

        # Find all ### subsections (features) with descriptions
        subsection_pattern = r'###\s+([0-9.]+)\s+(.+?)\n\*\*Description:\*\*\s+(.+?)(?=\n####|\n###|\n##|\Z)'
        subsections = re.finditer(subsection_pattern, main_section, re.DOTALL)

        for match in subsections:
            subsection_number = match.group(1)
            subsection_name = match.group(2).strip()
            description = match.group(3).strip()

            # Get the full content of this subsection for extracting steps
            subsection_start = match.start()
            next_subsection = re.search(r'\n###\s+', main_section[match.end():])
            if next_subsection:
                subsection_content = main_section[subsection_start:match.end() + next_subsection.start()]
            else:
                # Look for next ## section
                next_section = re.search(r'\n##\s+', main_section[match.end():])
                if next_section:
                    subsection_content = main_section[subsection_start:match.end() + next_section.start()]
                else:
                    subsection_content = main_section[subsection_start:]

            # Determine category
            category = categorize_feature(section_title, subsection_name, description)

            # Clean description - ensure it's 1-2 sentences
            clean_desc = clean_description(description)
            sentences = re.split(r'[.!?]\s+', clean_desc)
            if len(sentences) > 2:
                clean_desc = '. '.join(sentences[:2]) + '.'

            # Extract steps
            steps = extract_steps(subsection_content, subsection_name)

            feature = {
                "category": category,
                "description": clean_desc,
                "steps": steps,
                "passes": False
            }

            features.append(feature)

    return features

def main():
    """Main function to parse and generate features.json."""
    input_file = '/workspace/Feature_Spec.md'
    output_file = '/workspace/features.json'

    print(f"Parsing {input_file}...")
    features = parse_markdown_file(input_file)

    print(f"Extracted {len(features)} features")

    # Validate features
    for i, feature in enumerate(features):
        assert 'category' in feature, f"Feature {i} missing category"
        assert feature['category'] in ['functional', 'ui', 'integration', 'security', 'performance'], f"Invalid category: {feature['category']}"
        assert 'description' in feature, f"Feature {i} missing description"
        assert 'steps' in feature, f"Feature {i} missing steps"
        assert len(feature['steps']) >= 3, f"Feature {i} has less than 3 steps"
        assert len(feature['steps']) <= 7, f"Feature {i} has more than 7 steps"
        assert 'passes' in feature, f"Feature {i} missing passes"
        assert feature['passes'] == False, f"Feature {i} passes should be False"

    print("All features validated successfully")

    # Write to JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(features, f, indent=2, ensure_ascii=False)

    print(f"Successfully wrote {len(features)} features to {output_file}")

    # Print category breakdown
    category_counts = {}
    for feature in features:
        cat = feature['category']
        category_counts[cat] = category_counts.get(cat, 0) + 1

    print("\nCategory breakdown:")
    for cat, count in sorted(category_counts.items()):
        print(f"  {cat}: {count}")

if __name__ == '__main__':
    main()
