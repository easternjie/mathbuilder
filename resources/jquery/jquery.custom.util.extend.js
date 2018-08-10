/**
 * jQuery自定义扩展工具js
 * 
 * Created by YJJ on 2018/04/06.
 */
(function ($) {
    $.extend({
    	/*
    	 * --利用boostrap alert警告框及 实现 展示优雅的操作结果提示
		 * 调用方式：$.showResultInfo({type:"success"});
    	 */
        showResultInfo: function(opt){
        	var ResultInfo = {
        		defaultOpt: {
        			info: "操作成功",
                    type: "success",//success danger info warning
                    css:{
                    	"position": "fixed",
                    	"margin": 0,
                    	"right": "-10rem",
        				"bottom": 0,
        				"width": "10rem"
                    }
        		},
                html: '<div class="alert fade in">'
                	+'<a href="#" class="close" data-dismiss="alert">&times;</a>'
                	+'<strong></strong></div>',
                show: function(opt){
                	opt = $.extend(this.defaultOpt,opt||{});
                	var myResultInfoDiv = $(this.html);
                	myResultInfoDiv.find("strong").html(opt.info);
                	$("body").append(myResultInfoDiv);
                	myResultInfoDiv.addClass("alert-"+opt.type)
					.css(opt.css)
					.alert()
					.animate({right:"0"},function(){
						var elt = $(this);
						setTimeout(function(){
							elt.animate({right:"-10rem"});
						},1000);
					});
					
                }
            };
        	ResultInfo.show(opt);
        },
        /*
         * 将form表单数据转为json对象并返回给调用者
         * 调用方式：$.form2JsonObj($("#formId"));
         */
        form2JsonObj:  function(form){   
        	if(typeof(form)=='undefined' || !form instanceof jQuery){
        		throw 'Param obj is not jQuery obj or undefined';
        		return;
        	}
        	var o = {};  
        	var a = form.serializeArray();    
        	$.each(a, function(i,v) {    
        		if (o[v.name]) {    
        			if (!o[v.name].push) {    
        				o[v.name] = [o[v.name]];    
        			}    
        			o[v.name].push(v.value || '');    
        		} else {    
        			o[v.name] = v.value || '';    
        		}    
        	});    
        	return o;    
    	}
    });
})(jQuery);