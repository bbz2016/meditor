/**
 * Created by bianwangyang on 2016/7/23.
 * �ƶ��˸��ı��༭��
 * �����������jQuery����zepto
 */

var QEDITOR_ALLOW_TAGS_ON_PASTE, QEDITOR_DISABLE_ATTRIBUTES_ON_PASTE, QEDITOR_TOOLBAR_HTML;

QEDITOR_TOOLBAR_HTML = "<div class=\"mqeditor_toolbar\">\n  <a href=\"#\" data-action=\"bold\" class=\"qe-bold\"><span class=\"fa fa-bold\" title=\"Bold\"></span></a> \n  <a href=\"#\" data-action=\"italic\" class=\"qe-italic\"><span class=\"fa fa-italic\" title=\"Italic\"></span></a> \n  <a href=\"#\" data-action=\"underline\" class=\"qe-underline\"><span class=\"fa fa-underline\" title=\"Underline\"></span></a> \n  <a href=\"#\" data-action=\"strikethrough\" class=\"qe-strikethrough\"><span class=\"fa fa-strikethrough\" title=\"Strike-through\"></span></a>		 \n  <span class=\"vline\"></span>\n  <span class=\"qe-icon qe-heading\">\n    <ul class=\"qe-menu\">\n      <li><a href=\"#\" data-name=\"h1\" class=\"qe-h1\">Heading 1</a></li>\n      <li><a href=\"#\" data-name=\"h2\" class=\"qe-h2\">Heading 2</a></li>\n      <li><a href=\"#\" data-name=\"h3\" class=\"qe-h3\">Heading 3</a></li>\n      <li><a href=\"#\" data-name=\"h4\" class=\"qe-h4\">Heading 4</a></li>\n      <li><a href=\"#\" data-name=\"h5\" class=\"qe-h5\">Heading 5</a></li>\n      <li><a href=\"#\" data-name=\"h6\" class=\"qe-h6\">Heading 6</a></li>\n      <li class=\"qe-hline\"></li>\n      <li><a href=\"#\" data-name=\"p\" class=\"qe-p\">Paragraph</a></li>\n    </ul>\n    <span class=\"icon fa fa-font\"></span>\n  </span>\n  <span class=\"vline\"></span>\n  <a href=\"#\" data-action=\"insertorderedlist\" class=\"qe-ol\"><span class=\"fa fa-list-ol\" title=\"Insert Ordered-list\"></span></a> \n  <a href=\"#\" data-action=\"insertunorderedlist\" class=\"qe-ul\"><span class=\"fa fa-list-ul\" title=\"Insert Unordered-list\"></span></a> \n  <a href=\"#\" data-action=\"indent\" class=\"qe-indent\"><span class=\"fa fa-indent\" title=\"Indent\"></span></a> \n  <a href=\"#\" data-action=\"outdent\" class=\"qe-outdent\"><span class=\"fa fa-outdent\" title=\"Outdent\"></span></a> \n  <span class=\"vline\"></span> \n  <a href=\"#\" data-action=\"insertHorizontalRule\" class=\"qe-hr\"><span class=\"fa fa-minus\" title=\"Insert Horizontal Rule\"></span></a> \n  <a href=\"#\" data-action=\"blockquote\" class=\"qe-blockquote\"><span class=\"fa fa-quote-left\" title=\"Blockquote\"></span></a> \n  <a href=\"#\" data-action=\"pre\" class=\"qe-pre\"><span class=\"fa fa-code\" title=\"Pre\"></span></a> \n  <a href=\"#\" data-action=\"createLink\" class=\"qe-link\"><span class=\"fa fa-link\" title=\"Create Link\" title=\"Create Link\"></span></a> \n  <a href=\"#\" data-action=\"insertimage\" class=\"qe-image\"><span class=\"fa fa-picture-o\" title=\"Insert Image\"></span></a> \n  <a href=\"#\" onclick=\"return QEditor.toggleFullScreen(this);\" class=\"qe-fullscreen pull-right\"><span class=\"fa fa-arrows-alt\" title=\"Toggle Fullscreen\"></span></a> \n</div>";

QEDITOR_ALLOW_TAGS_ON_PASTE = "div,p,ul,ol,li,hr,br,b,strong,i,em,img,h2,h3,h4,h5,h6,h7";

QEDITOR_DISABLE_ATTRIBUTES_ON_PASTE = ["style", "class", "id", "name", "width", "height"];

window.QEditor = {
  actions: ['bold', 'italic', 'underline', 'strikethrough', 'insertunorderedlist', 'insertorderedlist', 'blockquote', 'pre'],
  imageURL:'',
  action: function($el, a, p) {
    var editor;
    editor = $(".mqeditor_preview", $el.parent().parent());
    editor.find(".mqeditor_placeholder").remove();
    editor.focus();//编辑框聚焦，使得编辑框不失去焦点
    if (p === null) {
      p = false;
    }
    if (a === "blockquote" || a === "pre") {
      p = a;
      a = "formatBlock";
    }
    if (a === "createLink") {
      p = prompt("Type URL:");
      if (p.trim().length === 0) {
        return false;
      }
    } else if (a === "insertimage") {
      //p = prompt("Image URL:");
      //if (p.trim().length === 0) {
      //  return false;
      //}
      //直接执行插入图片命令，p是传入的图片URL
      document.execCommand(a, false, p);
      return true;
    }
    if (QEditor.state(a)) {
      document.execCommand(a, false, null);
    } else {
      document.execCommand(a, false, p);
    }
    QEditor.checkSectionState(editor);
    editor.change();
    return false;
  },
  state: function(action) {
    return document.queryCommandState(action) === true;
  },
  prompt: function(title) {
    var val;
    val = prompt(title);
    if (val) {
      return val;
    } else {
      return false;
    }
  },
  toggleFullScreen: function(el) {
    var border;
    border = $(el).parent().parent();
    if (border.data("qe-fullscreen") === "1") {
      QEditor.exitFullScreen();
    } else {
      QEditor.enterFullScreen(border);
    }
    return false;
  },
  enterFullScreen: function(border) {
    border.data("qe-fullscreen", "1").addClass("mqeditor_fullscreen");
    border.find(".mqeditor_preview").focus();
    return border.find(".qe-fullscreen span").attr("class", "fa fa-compress");
  },
  exitFullScreen: function() {
    return $(".mqeditor_border").removeClass("mqeditor_fullscreen").data("qe-fullscreen", "0").find(".qe-fullscreen span").attr("class", "fa fa-arrows-alt");
  },
  getCurrentContainerNode: function() {
    var containerNode, node;
    if (window.getSelection) {
      //console.log(window.getSelection());
      node = window.getSelection().anchorNode;
      //console.log(node);
      //nodeType:3 Text节点 1 Element节点
      containerNode = node.nodeType === 3 ? node.parentNode : node;
    }
    return containerNode;
  },
  //用于修改工具栏中各个链接的状态（检查命令是否可用）,如果链接被激活，则会加入qe-state-on类样式
  checkSectionState: function(editor) {
    var a, link, _i, _len, _ref, _results;
    _ref = QEditor.actions;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      link = editor.parent().find(".mqeditor_toolbar a[data-action=" + a + "]");
      if (QEditor.state(a)) {
        _results.push(link.addClass("qe-state-on"));
      } else {
        _results.push(link.removeClass("qe-state-on"));
      }
    }
    return _results;
  },
  version: function() {
    return "0.2.0";
  }
};

(function($) {
  return $.fn.mqeditor = function(options) {
    return this.each(function() {
      var currentVal, editor, obj, placeholder, qe_heading, toolbar;
      obj = $(this);
      obj.addClass("mqeditor");
      editor = $('<div class="mqeditor_preview clearfix" contentEditable="true"></div>');
      placeholder = $('<div class="mqeditor_placeholder"></div>');
/*      $(document).keyup(function(e) {
        if (e.keyCode === 27) {
          return QEditor.exitFullScreen();
        }
      });
      */
      document.execCommand('defaultParagraphSeparator', false, 'div');
      currentVal = obj.val();
      editor.html(currentVal);  //转移当前容器含的值
      editor.addClass(obj.attr("class")); //转移样式
      obj.after(editor);    //新生成的editor放在用户自定义的textarea的后面
      placeholder.text(obj.attr("placeholder"));
      editor.attr("placeholder", obj.attr("placeholder") || "");
      editor.append(placeholder);//转移placeholder
      //键盘聚焦事件。光标放在editor时触发
      editor.focusin(function(e) {
        console.log('focusin');
        //QEditor.checkSectionState(editor);
        return $(this).find(".mqeditor_placeholder").remove();//聚焦时去掉placeholder
      });
      //失去焦点的事件
      editor.blur(function(e) {
        console.log('blur event:'+e);
        var t;
        t = $(this);
        //QEditor.checkSectionState(editor);
        //处理异常，用于恢复placeholder
        if (t.html().length === 0 || t.html() === "<br>" || t.html() === "<p></p>") {
          return $(this).html('<div class="mqeditor_placeholder">' + $(this).attr("placeholder") + '</div>');
        }
      });
      editor.change(function(e) {
        console.log('change');
        var pobj, t;
        pobj = $(this);
        t = pobj.parent().find('.mqeditor');
        //t包含了被隐藏的textarea和新生成的editor两个容器，但是被隐藏的textarea没有写成功
        return t.val(pobj.html());
      });
      editor.on("paste", function() {
        var txt;
        txt = $(this);
        return setTimeout(function() {
          var attrName, els, _i, _len;
          els = txt.find("*");
          for (_i = 0, _len = QEDITOR_DISABLE_ATTRIBUTES_ON_PASTE.length; _i < _len; _i++) {
            attrName = QEDITOR_DISABLE_ATTRIBUTES_ON_PASTE[_i];
            els.removeAttr(attrName);
          }
          els.find(":not(" + QEDITOR_ALLOW_TAGS_ON_PASTE + ")").contents().unwrap();
          txt.change();
          return true;
        }, 100);
      });
      //增加触屏版的事件
      editor.on('keyup touchend',(function(e) {
        console.log('keyup touchend');
        //QEditor.checkSectionState(editor);
        //这里不需要主动触发change事件，因为keyup之后，会自动触发change事件
        //return $(this).change();
      }));


      editor.on("click touchstart", function(e) {
        console.log('click touchstart');
        //QEditor.checkSectionState(editor);
        return e.stopPropagation();
      });
      //这里还不能简单的把keydown事件映射成touchstart事件，因为
      //在模拟器中，鼠标点击选中时，会触发touchstart，原本应该触发click事件
      editor.on('keydown',function(e) {
        console.log('keydown touchstart');
        var node, nodeName;
        node = QEditor.getCurrentContainerNode();
        nodeName = "";
        if (node && node.nodeName) {
          nodeName = node.nodeName.toLowerCase();
        }
        //对Enter键的处理
        if (e.keyCode === 13 && !(e.shiftKey || e.ctrlKey)) {
          if (nodeName === "blockquote" || nodeName === "pre") {
            console.log('nodeName === "blockquote" || nodeName === "pre"');
            e.stopPropagation();
            document.execCommand('InsertParagraph', false);
            document.execCommand("formatBlock", false, "p");
            document.execCommand('outdent', false);
            return false;
          }
        }
      });
      var oFReader = new FileReader();
      oFReader.onload = function(oFREvent) {
        QEditor.imageURL = oFREvent.target.result;
        QEditor.action($("a[data-action='insertimage']"),"insertimage",QEditor.imageURL);
      };
      //�����ļ���ͼƬ���������ع���д������
      $("#fileInput").on("change",function(e){
        console.log('fileInput change');
        //$("#fileInput").parent('.fileupload-form').submit();
		if($("#fileInput")[0].files.length==0) {return;}
        var oFile = $("#fileInput")[0].files[0];
        oFReader.readAsDataURL(oFile);
        //QEditor.imageURL = e.currentTarget.value;
      }).on('click',function(e){
        console.log('fileInput click');
        editor.focus();
        //e.stopPropagation();
        //e.preventDefault();
        //alert('haha');
      });
      $("#exec_target").on("load",function(e) {
        var data = $(window.frames['exec_target'].document.body).html();
        data = data.replace(/<[^>]*>/g,'');
        var json;
        try{
          json = JSON.parse(data);
        } catch(e) {
          throw new Error('return data is invalid!');
        }
        QEditor.imageURL = 'http://img.wsdl.vivo.com.cn'+json.path;
        if($("#fileInput")[0].files.length==0) {return;}
        var oFile = $("#fileInput")[0].files[0];
        oFReader.readAsDataURL(oFile);
        //����ͼƬ
        //genImage(json,$currentForm);
      });
      obj.hide();
      obj.wrap('<div class="mqeditor_border"></div>');
      obj.after(editor);
      //生成toolbar快捷菜单
      toolbar = $(QEDITOR_TOOLBAR_HTML);
      //特殊处理head 1-7 的大小，移动端暂时不需要
/*      qe_heading = toolbar.find(".qe-heading");
      qe_heading.mouseenter(function() {
        $(this).addClass("hover");
        return $(this).find(".qe-menu").show();
      });
      qe_heading.mouseleave(function() {
        $(this).removeClass("hover");
        return $(this).find(".qe-menu").hide();
      });
      toolbar.find(".qe-heading .qe-menu a").click(function() {
        var link;
        link = $(this);
        link.parent().parent().hide();
        QEditor.action(this, "formatBlock", link.data("name"));
        return false;
      });
      */
      //点击相应的按钮，触发执行相应的编辑命令
      toolbar.find("a[data-action]").click(function() {
        return QEditor.action(this, $(this).attr("data-action"));
      });
      //移动端暂时不需要显示菜单栏，因此需要隐藏
      return editor.before(toolbar.css('display','none'));
    });
  };
})(jQuery);
