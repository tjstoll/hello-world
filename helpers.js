(function() {
  var Helpers, fs, gutil, hbs, highlighter, marked, path, templateData, toc, wiredep;

  fs = require('fs');

  path = require('path');

  gutil = require('gulp-util');

  marked = require('marked');

  toc = require('markdown-toc');

  highlighter = require('highlight.js');

  wiredep = require('wiredep')();

  hbs = new Object();

  templateData = new Object();

  Helpers = (function() {
    var link, navigation;

    function Helpers(handlebars, tplateData) {
      hbs = handlebars;
      templateData = tplateData;
      return {
        template: this.template,
        capitals: this.capitals,
        bodyInsert: this.bodyInsert,
        link: link,
        cssInject: this.cssInject,
        jsInject: this.jsInject,
        markdown: this.markdown,
        markdownHere: this.markdownHere,
        image: this.image,
        navigation: this.navigationWrapper
      };
    }

    Helpers.prototype.capitals = function(str) {
      return str.toUpperCase();
    };

    Helpers.prototype.bodyInsert = function(mode) {
      var content;
      if (mode !== 'live') {
        content = '<body></body>';
      } else {
        content = '';
      }
      return new hbs.SafeString(content);
    };

    Helpers.prototype.jsInject = function(mode) {
      var content, dir, j, k, l, len, len1, len2, ref, script, scripts;
      content = new String();
      if (mode === 'live') {
        dir = './build-live/js';
      } else {
        dir = './build-dev/js';
      }
      scripts = fs.readdirSync(dir);
      if (mode !== 'live') {
        content += "<!-- bower:js -->\n\t";
        ref = wiredep.js;
        for (j = 0, len = ref.length; j < len; j++) {
          script = ref[j];
          script = script.slice(script.indexOf('bower_components'));
          content += "<script src=\"" + script + "\"></script>\n\t";
        }
        content += "<!-- endbower -->\n\t";
      }
      for (k = 0, len1 = scripts.length; k < len1; k++) {
        script = scripts[k];
        if (mode === 'live' && script !== 'vendor_min_js') {
          content += "<script src=\"http://" + templateData.year + ".igem.org/Template:" + templateData.teamName + "/js/" + script + "?action=raw&ctype=text/javascript\"></script>\n\t";
        } else {
          if (script !== 'vendor_min_js') {
            content += "<script src=\"js/" + script + "\"></script>\n\t";
          }
        }
      }
      for (l = 0, len2 = scripts.length; l < len2; l++) {
        script = scripts[l];
        if (script === 'vendor_min_js') {
          content = ("<script src=\"http://" + templateData.year + ".igem.org/Template:" + templateData.teamName + "/js/" + script + "?action=raw&ctype=text/javascript\"></script>\n\t") + content;
        }
      }
      return new hbs.SafeString(content);
    };

    Helpers.prototype.cssInject = function(mode) {
      var content, dir, j, k, l, len, len1, len2, ref, styles, stylesheet;
      content = new String();
      if (mode === 'live') {
        dir = './build-live/css';
      } else {
        dir = './build-dev/css';
      }
      styles = fs.readdirSync(dir);
      if (mode !== 'live') {
        content += "<!-- bower:css -->\n\t";
        ref = wiredep.css;
        for (j = 0, len = ref.length; j < len; j++) {
          stylesheet = ref[j];
          stylesheet = stylesheet.slice(stylesheet.indexOf('bower_components'));
          content += "<link rel=\"stylesheet\" href=\"" + stylesheet + "\" type=\"text/css\" />\n\t";
        }
        content += "<!-- endbower -->\n\t";
      }
      if (mode === 'live') {
        content += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">\n\t';
      }
      for (k = 0, len1 = styles.length; k < len1; k++) {
        stylesheet = styles[k];
        if (mode === 'live' && stylesheet !== 'vendor_min_css') {
          content += "<link rel=\"stylesheet\" href=\"http://" + templateData.year + ".igem.org/Template:" + templateData.teamName + "/css/" + stylesheet + "?action=raw&ctype=text/css\" type=\"text/css\" />\n\t";
        } else if (stylesheet !== 'vendor_min_css') {
          content += "<link rel=\"stylesheet\" href=\"css/" + stylesheet + "\" type=\"text/css\" />\n\t";
        }
      }
      for (l = 0, len2 = styles.length; l < len2; l++) {
        stylesheet = styles[l];
        if (stylesheet === 'vendor_min_css') {
          content = ("<link rel=\"stylesheet\" href=\"http://" + templateData.year + ".igem.org/Template:" + templateData.teamName + "/css/" + stylesheet + "?action=raw&ctype=text/css\" type=\"text/css\" />\n\t") + content;
        }
      }
      return new hbs.SafeString(content);
    };

    Helpers.prototype.image = function(img, format, mode) {
      var content, fmt, imageStores;
      if (mode === 'live') {
        if (format === 'directlink') {
          if (fs.readdirSync(__dirname).indexOf('images.json') !== -1) {
            imageStores = JSON.parse(fs.readFileSync('images.json'));
            content = imageStores[img];
          } else {
            content = '';
          }
        } else {
          if (format === 'file') {
            fmt = 'File';
          } else if (format === 'media') {
            fmt = 'Media';
          }
          content = "</html> [[File:" + templateData.teamName + "_" + templateData.year + "_" + img + "]] <html>";
        }
      } else {
        if (format !== 'directlink') {
          content = "<img src=\"images/" + img + "\" />";
        } else {
          content = "images/" + img;
        }
      }
      return new hbs.SafeString(content);
    };

    link = function(linkName, mode) {
      if (mode === 'live') {
        if (linkName === 'index') {
          return "http://" + templateData.year + ".igem.org/Team:" + templateData.teamName;
        } else {
          return "http://" + templateData.year + ".igem.org/Team:" + templateData.teamName + "/" + templateData.links[linkName];
        }
      } else {
        if (linkName === 'index') {
          return 'index.html';
        } else {
          return linkName + ".html";
        }
      }
    };

    navigation = function(field, mode, active1, active2, recursed) {
      var active, actives, arg, content, i, isActive, item, j, k, l, len, len1, newItem, ref, value;
      content = "<ul>\n";
      actives = new Array();
      for (i = j = 0, len = arguments.length; j < len; i = ++j) {
        arg = arguments[i];
        if (i >= 2) {
          actives.push(arg);
        }
      }
      for (item in field) {
        value = field[item];
        isActive = false;
        for (k = 0, len1 = actives.length; k < len1; k++) {
          active = actives[k];
          if (item === active) {
            isActive = true;
          }
        }
        if (item[0] === '_') {
          newItem = '';
          for (i = l = 1, ref = item.length - 1; 1 <= ref ? l <= ref : l >= ref; i = 1 <= ref ? ++l : --l) {
            newItem += item[i];
          }
          item = newItem;
        }
        if (typeof value === 'object') {
          if (isActive) {
            content += "<li class=\"active\"><a href=\"#\"><span>" + item + "</span></a>\n";
          } else {
            content += "<li><a href=\"#\"><span>" + item + "</span></a>\n";
          }
          content += navigation(value, mode, active1, active2, true);
        } else {
          if (isActive) {
            content += "<li class=\"active\"><a href=\"" + (link(item, mode)) + "\"><span>" + value + "</span></a></li>\n";
          } else {
            content += "<li><a href=\"" + (link(item, mode)) + "\"><span>" + value + "</span></a></li>\n";
          }
          content += "</li>\n";
        }
      }
      content += "</ul>\n";
      return content;
    };

    Helpers.prototype.navigationWrapper = function(mode, active1, active2) {
      var content;
      content = "<div id=\"navigation\">\n";
      content += navigation(templateData.navigation, mode, active1, active2);
      content += "</div>";
      return new hbs.SafeString(content);
    };

    Helpers.prototype.template = function(templateName, mode) {
      var template;
      template = hbs.compile(fs.readFileSync(__dirname + "/src/templates/" + templateName + ".hbs", 'utf8'));
      if (mode === 'live') {
        if (templateName === 'preamble') {
          return new hbs.SafeString('');
        }
        return new hbs.SafeString("{{" + templateData.teamName + "/" + templateName + "}}");
      } else {
        return new hbs.SafeString(template(templateData));
      }
    };

    Helpers.prototype.markdownHere = function(string, options) {
      var handlebarsedMarkdown, markedHtml;
      marked.setOptions({
        highlight: function(code) {
          return highlighter.highlightAuto(code).value;
        }
      });
      handlebarsedMarkdown = hbs.compile(string)(templateData);
      markedHtml = marked(handlebarsedMarkdown);
      return new hbs.SafeString(markedHtml);
    };

    Helpers.prototype.markdown = function(file) {
      var content, handlebarsedMarkdown, markdownFile;
      marked.setOptions({
        highlight: function(code) {
          return highlighter.highlightAuto(code).value;
        }
      });
      markdownFile = fs.readFileSync(__dirname + "/src/markdown/" + file + ".md").toString();
      handlebarsedMarkdown = hbs.compile(markdownFile)(templateData);
      content = '<div class="content" id="content-main">';
      content += '<div class="row">';
      content += '<div class="col col-lg-8 col-md-12"><div class="content-main">' + marked(handlebarsedMarkdown) + '</div></div>';
      content += '<div id="tableofcontents" class="tableofcontents affix sidebar col-lg-4 hidden-xs hidden-sm hidden-md visible-lg-3"><ul class="nav">' + marked(toc(handlebarsedMarkdown, {
        firsth1: false,
        maxdepth: 5
      }).content).slice(4) + '</div>';
      content += "</div></div>";
      return new hbs.SafeString(content);
    };

    return Helpers;

  })();

  module.exports = Helpers;

}).call(this);
