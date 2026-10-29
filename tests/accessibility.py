"""Automated axe WCAG checks for the five main application steps."""
import os,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
base=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:4173'
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1100})
    page.goto(base,wait_until='networkidle')
    page.add_script_tag(path=str(Path(__file__).resolve().parent.parent/'node_modules/axe-core/axe.min.js'))
    for step in range(5):
        page.locator('.steps .step').nth(step).click()
        result=page.evaluate("async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})")
        assert not result['violations'],[(v['id'],[n['target'] for n in v['nodes']]) for v in result['violations']]
        print(f'PASS: step {step+1}, no automated WCAG A/AA violations')
    page.locator('.steps .step').nth(1).click()
    page.get_by_role('button',name='Continue to fixture preference',exact=True).click()
    page.locator('summary').filter(has_text='Explore fixture illustrations').click()
    page.locator('summary').filter(has_text='Secondary calculation settings').click()
    page.get_by_label('Credit this group to the average task-plane illuminance',exact=True).first.check()
    result=page.evaluate("async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})")
    assert not result['violations'],[(v['id'],[n['target'] for n in v['nodes']]) for v in result['violations']]
    print('PASS: mixed layers, credited group fields and expanded fixture gallery')
    page.get_by_role('button',name='Lighting guide',exact=False).click()
    result=page.evaluate("async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})")
    assert not result['violations'],[(v['id'],[n['target'] for n in v['nodes']]) for v in result['violations']]
    print('PASS: knowledge dialog')
    browser.close()
