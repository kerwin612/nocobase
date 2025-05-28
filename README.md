# NocoBase Custom Selector Plugin

This is a custom selector plugin for NocoBase that provides enhanced association field selection capabilities with customizable rendering functions.

## Features

- **Custom Rendering**: Configure custom render functions for list items and selected values
- **Rich Display**: Support for avatars, multiple field display, and custom styling
- **Field Information**: Automatically displays available fields from target collection to help users configure render functions
- **Multi-language Support**: Supports English, Chinese, and Japanese
- **Easy Configuration**: Simple modal-based configuration interface

## Usage

1. **Enable Custom Selector**: In the field settings of an association field, toggle on "Custom Selector"
2. **Configure Rendering**: Click "Configure Custom Selector" to open the configuration modal
3. **View Available Fields**: The configuration modal shows all available fields from the target collection
4. **Edit Render Functions**: Customize the `renderItem` function for list display and `renderValue` function for selected value display
5. **Save Configuration**: Click "Confirm" to save your custom render functions

## Configuration

### Available Fields Display
The configuration modal automatically detects and displays all available fields from the target collection, including:
- Field name
- Field title (if different from name)
- Field interface type

### Render Functions

#### List Item Render Function (`renderItem`)
- **Parameter**: `item` - The data object for each item in the selection list
- **Return**: HTML string for rendering the list item
- **Default**: Displays avatar, name, and secondary information (department, email, phone)

#### Selected Value Render Function (`renderValue`)
- **Parameter**: `value` - The selected data object
- **Return**: HTML string for rendering the selected value
- **Default**: Displays avatar and name in a compact format

### Example Usage

```javascript
// Example renderItem function
function(item) {
  var name = item.name || item.title || item.id || '';
  var department = item.department || '';
  var email = item.email || '';
  
  return '<div style="display: flex; align-items: center;">' +
    '<div style="margin-right: 12px;">' +
      '<div style="width: 40px; height: 40px; border-radius: 50%; background-color: #1890ff; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">' +
        String(name).charAt(0).toUpperCase() +
      '</div>' +
    '</div>' +
    '<div>' +
      '<div style="font-weight: bold;">' + name + '</div>' +
      (department ? '<div style="color: #8c8c8c; font-size: 12px;">' + department + '</div>' : '') +
    '</div>' +
  '</div>';
}
```

## Installation

This plugin is part of the NocoBase ecosystem. To use it:

1. Ensure you have NocoBase installed and running
2. The plugin should be available in your NocoBase instance
3. Enable the plugin in the plugin manager if needed

---

English | [中文](./README.zh-CN.md) | [日本語](./README.ja-JP.md)

https://github.com/user-attachments/assets/a50c100a-4561-4e06-b2d2-d48098659ec0

<p align="center">
<a href="https://trendshift.io/repositories/4112" target="_blank"><img src="https://trendshift.io/api/badge/repositories/4112" alt="nocobase%2Fnocobase | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>
<a href="https://www.producthunt.com/posts/nocobase?embed=true&utm_source=badge-top-post-topic-badge&utm_medium=badge&utm_souce=badge-nocobase" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/top-post-topic-badge.svg?post_id=456520&theme=light&period=weekly&topic_id=267" alt="NocoBase - Scalability&#0045;first&#0044;&#0032;open&#0045;source&#0032;no&#0045;code&#0032;platform | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
</p>

## What is NocoBase

NocoBase is an extensibility-first, open-source no-code development platform.   
Instead of investing years of time and millions of dollars in research and development, deploy NocoBase in a few minutes and you'll have a private, controllable, and extremely scalable no-code development platform!

Homepage:  
https://www.nocobase.com/  

Online Demo:  
https://demo.nocobase.com/new

Documents:  
https://docs.nocobase.com/

Forum:  
https://forum.nocobase.com/

Tutorials:  
https://www.nocobase.com/en/tutorials

Use Cases:  
https://www.nocobase.com/en/blog/tags/customer-stories

## Quickstart

To get a quick working development environment you could use Gitpod.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/nocobase/nocobase)

## Release Notes

Our [blog](https://www.nocobase.com/en/blog/timeline) is regularly updated with release notes and provides a weekly summary.

## Distinctive features

### 1. Data model-driven

Most form-, table-, or process-driven no-code products create data structures directly in the user interface, such as Airtable, where adding a new column to a table is adding a new field. This has the advantage of simplicity of use, but the disadvantage of limited functionality and flexibility to meet the needs of more complex scenarios.

NocoBase adopts the design idea of separating the data structure from the user interface, allowing you to create any number of blocks (data views) for the data collections, with different type, styles, content, and actions in each block. This balances the simplicity of no-code operation with the flexibility of native development.

![model](https://static-docs.nocobase.com/model.png)

### 2. What you see is what you get

NocoBase enables the development of complex and distinctive business systems, but this does not mean that complex and specialized operations are required. With a single click, configuration options are displayed on the usage interface, and administrators with system configuration privileges can directly configure the user interface in a WYSIWYG manner.

![wysiwyg](https://static-docs.nocobase.com/wysiwyg.gif)

### 3. Everything is implemented as plugins

NocoBase adopts plugin architecture, all new functions can be realized by developing and installing plugins, and expanding the functions is as easy as installing an APP on your phone.

![plugins](https://static-docs.nocobase.com/plugins.png)

## Installation

NocoBase supports three installation methods:

- <a target="_blank" href="https://docs.nocobase.com/welcome/getting-started/installation/docker-compose">Installing With Docker (👍Recommended)</a>

  Suitable for no-code scenarios, no code to write. When upgrading, just download the latest image and reboot.

- <a target="_blank" href="https://docs.nocobase.com/welcome/getting-started/installation/create-nocobase-app">Installing from create-nocobase-app CLI</a>

  The business code of the project is completely independent and supports low-code development.

- <a target="_blank" href="https://docs.nocobase.com/welcome/getting-started/installation/git-clone">Installing from Git source code</a>

  If you want to experience the latest unreleased version, or want to participate in the contribution, you need to make changes and debug on the source code, it is recommended to choose this installation method, which requires a high level of development skills, and if the code has been updated, you can git pull the latest code.
