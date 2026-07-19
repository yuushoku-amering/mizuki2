import re

with open('/f/Mizuki/src/config/siteConfig.ts', 'r') as f:
    content = f.read()

# 1. Desktop array: add 5-8 after 4
old_desktop = '\t\t\t\tdesktop: [\n\t\t\t\t\t"/images/backgrounds/1.jpg",\n\t\t\t\t\t"/images/backgrounds/2.jpg",\n\t\t\t\t\t"/images/backgrounds/3.jpg",\n\t\t\t\t\t"/images/backgrounds/4.jpg",\n\t\t\t\t], // 桌面横幅图片'
new_desktop = '\t\t\t\tdesktop: [\n\t\t\t\t\t"/images/backgrounds/1.jpg",\n\t\t\t\t\t"/images/backgrounds/2.jpg",\n\t\t\t\t\t"/images/backgrounds/3.jpg",\n\t\t\t\t\t"/images/backgrounds/4.jpg",\n\t\t\t\t\t"/images/backgrounds/5.jpg",\n\t\t\t\t\t"/images/backgrounds/6.jpg",\n\t\t\t\t\t"/images/backgrounds/7.jpg",\n\t\t\t\t\t"/images/backgrounds/8.jpg",\n\t\t\t\t], // 桌面横幅图片'
if old_desktop in content:
    content = content.replace(old_desktop, new_desktop)
    print("Desktop array updated")
else:
    print("Desktop array NOT FOUND")

# 2. Mobile array: replace with all 8
old_mobile = '\t\t\t\tmobile: [\n\t\t\t\t\t"/images/backgrounds/5.jpg",\n\t\t\t\t\t"/images/backgrounds/6.jpg",\n\t\t\t\t\t"/images/backgrounds/7.jpg",\n\t\t\t\t\t"/images/backgrounds/8.jpg",\n\t\t\t\t], // 移动横幅图片'
new_mobile = '\t\t\t\tmobile: [\n\t\t\t\t\t"/images/backgrounds/1.jpg",\n\t\t\t\t\t"/images/backgrounds/2.jpg",\n\t\t\t\t\t"/images/backgrounds/3.jpg",\n\t\t\t\t\t"/images/backgrounds/4.jpg",\n\t\t\t\t\t"/images/backgrounds/5.jpg",\n\t\t\t\t\t"/images/backgrounds/6.jpg",\n\t\t\t\t\t"/images/backgrounds/7.jpg",\n\t\t\t\t\t"/images/backgrounds/8.jpg",\n\t\t\t\t], // 移动横幅图片'
if old_mobile in content:
    content = content.replace(old_mobile, new_mobile)
    print("Mobile array updated")
else:
    print("Mobile array NOT FOUND")

# 3. Add imagePosition
old_pos = '\t\t\tposition: "center", // 等同于 object-position，仅支持 \'top\', \'center\', \'bottom\'。默认为 \'center\''
new_pos = '\t\t\tposition: "center", // 等同于 object-position，仅支持 \'top\', \'center\', \'bottom\'。默认为 \'center\'\n\t\t\timagePosition: {\n\t\t\t\t"/images/backgrounds/1.jpg": "top",\n\t\t\t\t"/images/backgrounds/2.jpg": "top",\n\t\t\t},'
if old_pos in content:
    content = content.replace(old_pos, new_pos)
    print("imagePosition added")
else:
    print("position line NOT FOUND")

with open('/f/Mizuki/src/config/siteConfig.ts', 'w') as f:
    f.write(content)

print('Done')
