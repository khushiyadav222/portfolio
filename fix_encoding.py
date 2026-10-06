import pathlib
p = pathlib.Path(r'D:\gold\portfolio\index.html')
t = p.read_text(encoding='utf-8')
print('BEFORE:', t.count('â'))
fixes = {
    'â€”': '—',
    'â€¢': '•',
    'â†’': '→',
    'â•': '═',
    'Â©': '©',
}
for k, v in fixes.items():
    c = t.count(k)
    print(k, c)
    t = t.replace(k, v)
# remove BOM if present
if t.startswith('\ufeff'):
    t = t.lstrip('\ufeff')
    print('BOM removed')
p.write_text(t, encoding='utf-8')
print('AFTER:', t.count('â'))
print('DONE')
