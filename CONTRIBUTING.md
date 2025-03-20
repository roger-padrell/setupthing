## Contributing
To contribute to this project by adding available software, create a pull request that adds it to `software.json` following this format:
```
"<software name>":{
    "icon":"<URL to software icon or 'undefined' for default>",
    "name":"<software name with format>",
    "methods":{
        "<method name>":"<software name in method>",
    }
}
```

## Example
```
"firefox": {
    "icon": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Firefox_logo%2C_2019.svg/1200px-Firefox_logo%2C_2019.svg.png",
    "name": "Firefox",
    "methods": {
        "apt": "firefox",
        "dnf": "firefox",
        "pacman": "firefox",
        "zypper": "MozillaFirefox",
        "snap": "firefox",
        "flatpak": "org.mozilla.firefox"
    }
}
```
