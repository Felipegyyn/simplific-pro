with open('meuassessor_test.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('teamNotification')
print(content[max(0, idx-500):idx+500])
