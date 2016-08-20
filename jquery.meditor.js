/**
 * Created by Bianwangyang on 2016/7/27.
 * 为移动端定制的富文本编辑器
 * Author: Bianwangyang
 * Email: evan_bang@qq.com
 * GitHub地址是：https://github.com/bbz2016/meditor
 */

window.MEditor = {
    $meditor: $('.meditor_preview'),
    prompt: '',
    row:-1, //默认是第一段文本，没有p标签包裹
    column:0,
    action: function(action,prompt) {
        var $editor = window.MEditor.$meditor;
        $editor.find('.meditor_placeholder').remove();
        $editor.focus();
        if(!prompt) {
            prompt = false;
        }
        if(document.queryCommandState(action)) {
            document.execCommand(action,false,null);
        } else {
            document.execCommand(action,false,prompt);
        }
        $editor.change();
    },
    getCurrentContainerNode: function(currentTarget) {
        var containerNode, node;
        //$('#debug').append('<div>getCurrentContainerNode2</div>');
        if(window.getSelection) {
            //$('#debug').append('<div>window.getSelection</div>');
            node = window.getSelection().anchorNode;
            if(!node) {
                node = currentTarget;
            }
            //$('#debug').append('<div>node.nodeType='+node.nodeType+'</div>');
            //$('#debug').append('<div>node.nodeName='+node.nodeName+'</div>');
            //UC浏览器中，对#text类型的节点，parentNode错误的取为父元素的父元素（div），不是p元素
            containerNode = node.nodeType === 3 ? node.parentNode : node;
        } else {
            //$('#debug').append('<div>no window.getSelection</div>');
        }
        if(document.getSelection) {
            //$('#debug').append('<div>document.getSelection</div>');
        }
        return containerNode;
    },
    getCurrentXOffset: function() {
        var range,xoffset=0;
        if(window.getSelection) {
            range = window.getSelection().getRangeAt(0);
            if(range) {
                xoffset = range.startOffset;
            }
        }
        return xoffset;
    },
    getPosition: function(containerNode) {
        //获取当前行
        if(containerNode && containerNode.classList.contains('textarea')) {
            //说明是第一段文本
            MEditor.row = -1;
        } else {
            MEditor.row = $(containerNode).index();
        }
        console.log('当前光标在第',MEditor.row,'个文本元素');
        //获取当前列
        MEditor.column = MEditor.getCurrentXOffset(containerNode);
        console.log('当前光标在第',MEditor.column,'列');
    },
    createNewImage: function(imgUrl,isFace) {
        $('.meditor_preview').find('.current-img').removeClass('current-img');
        var currImg;
        if(isFace) {
            //currImg = '<span class="img current-img face-img"><img src="'+imgUrl+'"/></span>';
            currImg = '<span contentEditable="false" class="img current-img face-img" style="background-image:url('+imgUrl+')" data-src="'+imgUrl+'"></span>';
        } else {
            //currImg = '<span class="img current-img user-img"><img src="http://localhost'+imgUrl+'"/></span>';
            // currImg = '<span contentEditable="false" class="img current-img user-img" style="background-image:url(http://localhost'+imgUrl+')" data-src="'+imgUrl+'"></span>';
            currImg = '<span contentEditable="false" class="img current-img user-img" style="background-image:url('+imgUrl+')" data-src="'+imgUrl+'"><div class="delete-img"><div class="line1"></div><div class="line2"></div></div></span>';
        }

        return currImg;
    }

};
(function($){
    /**
     *
     * @param options
     * @returns {*}
     *
     */
    $.fn.meditor = function(options){
        return this.each(function(){
            var currentVal, $meditor, $obj, $placeholder;
            $obj = $(this);     //容器模板textarea
            $obj.addClass('meditor');
            //新生成的富文本编辑容器
            $meditor = $('<div class="meditor_preview" id="contentID" contenteditable="true"></div>');
            $placeholder = $('<div class="meditor_placeholder"></div>');

            currentVal = $obj.val();
            $meditor.html(currentVal);  //转移当前容器模板含的值
            $meditor.addClass($obj.attr("class"));  //转移样式
            //$obj.after($meditor);   //富文本容器放在模板后面

            $placeholder.text($obj.attr("placeholder"));
            $meditor.attr("placeholder", $obj.attr("placeholder") || "");
            $meditor.append($placeholder);  //转移placeholder。模拟placeholder

            $obj.hide();
            $obj.wrap('<div class="meditor_border"></div>');//模板和编辑器的容器
            $obj.after($meditor);//富文本容器放在模板后面
            document.execCommand('defaultParagraphSeparator', false, 'p');  //使用p标签作为文本分割符
            //以下用来处理各种事件
            //聚焦编辑框时，需要移除placeholder
            $meditor.focusin(function(e) {
                console.log(e.type);
                $(this).find(".meditor_placeholder").remove();
                var containerNode = MEditor.getCurrentContainerNode(e.currentTarget);
                //var xoffset = MEditor.getCurrentXOffset();
                if(containerNode.nodeName==='DIV'&&containerNode.textContent===''&&containerNode.childNodes.length===0&&containerNode.classList.contains('textarea')) {
                    //表示第一行文本元素，它没有被p标签包含，并且没有p标签（内含img）的存在。
                    //document.execCommand('formatBlock',false,'p');
                    //document.execCommand('refresh',false);
                    //document.execCommand('insertparagraph',false,'');
/*
                    var n = document.createElement('p');
                    var ref;
                    if(containerNode.firstChild) {
                        n.textContent = containerNode.firstChild.textContent;
                    }
                    ref = containerNode.firstChild;
                    if(ref) {
                        containerNode.replaceChild(n,ref);
                    } else {
                        containerNode.appendChild(n);
                    }

                    */
                }
            });
            //编辑框失去焦点
            $meditor.blur(function(e) {
                console.log(e.type,',target=', e.currentTarget);
                $('#debug').append('<div>$meditor blur fire1</div>');
                var t = $(this);
                var containerNode = MEditor.getCurrentContainerNode();
                console.log('containerNode=',containerNode);
                var firstChild = e.currentTarget.firstChild;
                console.log('e.currentTarget.firstChild=',e.currentTarget.firstChild);
                //有可能需要恢复placeholder。
                if (t.html().length === 0 || t.html() === "<br>" || t.html() === "<p></p>") {
                    $('#debug').append('<div>placeholder</div>');
                    MEditor.row = 0;
                    MEditor.column = 0;
                    return $(this).html('<div class="meditor_placeholder">' + $(this).attr("placeholder") + '</div>');
                }
                //失去焦点时，要保存当前光标所在的位置--行和列
                //$('#debug').append('<div>before getCurrentContainerNode1</div>');
                if(containerNode.nodeName==='DIV'&&containerNode.classList.contains('textarea')) {
                    //表示第一行文本元素，它没有被p标签包含
                    console.log('formatBlock begin');
                    document.execCommand('formatBlock',false,'P');
                    //当前浏览器不支持refresh命令
                    //document.execCommand('refresh',false);
                    /*
                    var n = document.createElement('p');
                    n.textContent = containerNode.firstChild.textContent;
                    var ref = containerNode.firstChild;
                    containerNode.replaceChild(n,ref);
                    //这里要更新最新的containerNode，因为上面代码已经改变了DOM结构了
                    containerNode = MEditor.containerNode = n;
                    */
                }
                $('#debug').append('<div>containerNode.nodeName='+containerNode.nodeName+'</div>');
                //setTimeout(MEditor.getPosition,3000,containerNode);

                //获取当前行
                if(containerNode && containerNode.classList.contains('textarea')) {
                    //说明是第一段文本，当前也被p标签包裹了
                    MEditor.row = 0;
                } else {
                    MEditor.row = $(containerNode).index();
                }
                MEditor.column = MEditor.getCurrentXOffset();
                console.log('当前光标在第',MEditor.row,'个文本元素');
                $('#debug').append('<div>当前光标在第'+MEditor.row+'个文本元素');
                //获取当前列
                console.log('当前光标在第',MEditor.column,'列');
                $('#debug').append('<div>当前光标在第'+MEditor.column+'列');
            });
            $meditor.on("click", function(e) {
                console.log(e.type);
                $('.meditor_preview').find('.current-img').removeClass('current-img');
                //$('#faceCtn').attr('hidden','');
                var $target = $(e.target),$delimg=$target.closest('.delete-img');
                if($delimg.length>0) {
                    $delimg.closest('.user-img').remove();
                }
                return e.stopPropagation(); //防止click事件被父元素捕捉到
            });
            $meditor.on("change",function(e) {
                console.log(e.type);
                var $pobj, $t;
                $pobj = $(this);
                $t = $pobj.parent().find('.meditor');
                var currentContainer = MEditor.getCurrentContainerNode();
                if(currentContainer.nodeName!=='P') {
                    //说明是第一行，只有文本节点，需要用p标签包裹着
                    /*
                    var n = document.createElement('p');
                    var ref;
                    ref = currentContainer.firstChild;
                    if(ref) {
                        currentContainer.replaceChild(n,ref);
                    } else {
                        currentContainer.appendChild(n);
                    }
                    */
                }
                //console.log($t);
                //t包含了被隐藏的textarea和新生成的editor两个容器，是将新生成的HTML作为值写入隐藏容器的val值
                //存储了输入的值用于提交
                return $t.val($pobj.html());
            });
            $meditor.on("keydown",function(e) {
                var node, nodeName;
                node = MEditor.getCurrentContainerNode();
                nodeName = "";
                if (node && node.nodeName) {
                    nodeName = node.nodeName.toLowerCase();
                }
                if (e.keyCode === 13 && !(e.shiftKey || e.ctrlKey)) {
                    if(nodeName === 'div') {
                        console.log('need format first line');
                        document.execCommand('formatBlock',false,'P');
                        /*
                        var n = document.createElement('p');
                        var ref;
                        if(node.firstChild) {
                            n.textContent = node.firstChild.textContent;
                        }
                        ref = node.firstChild;
                        if(ref) {
                            node.replaceChild(n,ref);
                        }
                        */
                        //document.execCommand('InsertParagraph', false);
                        //document.execCommand("formatBlock", false, "p");
                        //document.execCommand('refresh', false);
                    }
                    return true;
                }
            });
            $meditor.on('keyup',function(e){
                console.log(e.type);
                return $(this).change();
            });
            //全局保存编辑器引用，方便访问
            MEditor.$meditor = $meditor;
            //处理入参
            /*
            options = [{
                command: 'insertimage',
                prompt: 'https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/bd_logo1_31bdc765.png',
                el: document.getElementById('fileInput'),
                event: 'change',
                beforeAction: function(){}
            }]
            */
            if(options&&$.isArray(options)) {
                options.forEach(function(v,i){
                    $(v.el).on(v.event,function(e){
                        if(v.beforeAction && $.isFunction(v.beforeAction) && v.beforeAction(e)){
                            MEditor.action(v.command, MEditor.prompt);
                        }
                        //v.beforeAction && $.isFunction(v.beforeAction) && v.beforeAction();
                    });
                });
            }
        });
    }
})(jQuery);