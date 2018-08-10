/**
 * YJJ 2018年6月5日15:50:48
 */
// 页面主体
var pageObj = {
    init:function(){
        // 加载配置事件
        pageObj.loadEvents();
        // 加载配置数据
        pageObj.loadSettingData();
    },
    // 默认考试时间
    defaultTestTime:15,
    // 考试时间限制
    maxTestTime:120,
    // 大题数最大值限制
    maxPartNum:5,
    // 大题中所含小题最大值限制
    maxPartExercisesNum:30,
    // 加载配置事件
    loadEvents: function(){
        // 若不是管理员，则不允许访问高级设置
        /*var isAdmin = pageObj.getUrlParam("isAdmin");
        if(isAdmin!=1){
            $("#advancedSettingsBtn").hide();
        }*/
        // 选择 设定考试时间后，显示 考试时间input输入框
        $("#setTestTime").change(function(){
            if($(this).is( ":checked" )){
                $("#testTimeSpan").show();
            }else{
                $("#testTimeSpan").hide();
                //取消选择，则恢复到默认时间
                $("#testTimeSpan2").html(pageObj.defaultTestTime);
            }
        });
        // 考试时间最大值控制
        $("#testTime").change(function(){
            if($(this).val()>pageObj.maxTestTime){
                $(this).val(pageObj.maxTestTime);
            }
            $("#testTimeSpan2").html($(this).val());
        });

        // 大题数量变化后，下拉选择select跟随变化，同时限制大题数目
        var partSelect = $("#partSelect");
        var partNumInput = $("#partNum");
        partNumInput.change(function(){
            var opHtml = "<option value=''>请选择</option>";
            var partNum = partNumInput.val();
            if(partNum>pageObj.maxPartNum){
                partNum = pageObj.maxPartNum;
                partNumInput.val(partNum);
            }
            for(var i=1;i<=partNum;i++){
                opHtml+="<option value='"+(i-1)+"'>第"+i+"大题设置</option>";
            }
            partSelect.html(opHtml);
            pageObj.curSettingData.partNum = partNum;
        });
        // 下拉选择select变化后，大题设置区域显示，并加载当前大题的设定数据
        var partDetailDiv = $("#partDetailDiv");
        partSelect.change(function(){
            var lastPartId = partDetailDiv.attr("data-partId");
            var partId = partSelect.val();
            // 判断上份大题设置是否通过验证
            var isValidate = pageObj.adSFormValidator.form();
            if(!isValidate && lastPartId){
                $("#partSelect").val(lastPartId);
                return;
            }
            // 清除 通过/未通过 验证状态class
            $(".valid").removeClass("valid");
            $(".error").removeClass("error");
            // 重置表格状态
            pageObj.adSFormValidator.resetForm();
            // 若上一份大题id不为空,则保存上一份大题的配置至curSettingData中
            if(lastPartId){
                var tempLastPartDetail = {};
                tempLastPartDetail.partName = $("input[name=partName]").val();
                tempLastPartDetail.partExercisesNum = $("input[name=partExercisesNum]").val();
                var checkedPartTypeInput = $("input[name=partType]:checked");
                tempLastPartDetail.partType = checkedPartTypeInput.val();
                if(eval(checkedPartTypeInput.val())===1){
                    tempLastPartDetail.partTypeDetail = $("input[name=partExercisesModel]").val();
                }else{
                    tempLastPartDetail.partTypeDetail = {};
                    tempLastPartDetail.partTypeDetail.rangeMin = $("input[name=rangeMin]").val();
                    tempLastPartDetail.partTypeDetail.rangeMax = $("input[name=rangeMax]").val();
                    tempLastPartDetail.partTypeDetail.containsBrackets
                        = $("input[name=containsBrackets]:checked").val();
                    var mathFlagArr = [];
                    $.each($("input[name=mathFlag]:checked"),function(i,v){
                        mathFlagArr.push($(v).val());
                    });
                    tempLastPartDetail.partTypeDetail.mathFlag = mathFlagArr;
                    tempLastPartDetail.partTypeDetail.randomValNum = $("input[name=randomValNum]").val();
                }
                pageObj.curSettingData.partDetails[lastPartId] = tempLastPartDetail;
            }
            // 若当前大题id不为空
            if(partId){
                // 将data-partId属性切换为当前大题Id
                partDetailDiv.attr("data-partId",partId);
                // 展示大题详情设置区域
                partDetailDiv.show();
                // 读取当前大题的配置数据并展示在页面上
                var tempPartDetail = pageObj.curSettingData.partDetails[partId];
                // 页面表单元素
                var rangeMinInput = $("input[name=rangeMin]");
                var rangeMaxInput = $("input[name=rangeMax]");
                var containsBracketsInput = $("input[name=containsBrackets]");
                var mathFlagInput = $("input[name=mathFlag]");
                var randomValNumInput = $("input[name=randomValNum]");
                var partExercisesModelInput = $("input[name=partExercisesModel]");
                var partTypeInput = $("input[name=partType]");
                // 清空本大题 按规则随机类型设置数据
                rangeMinInput.val("");
                rangeMaxInput.val("");
                containsBracketsInput.prop("checked",false);
                mathFlagInput.prop("checked",false);
                randomValNumInput.val("");
                partExercisesModelInput.val("");
                partTypeInput.prop("checked",false);
                $(".partTypeDiv").hide();
                // 展示相应数据
                if(tempPartDetail){
                    $("input[name=partName]").val(tempPartDetail.partName);
                    $("input[name=partExercisesNum]").val(tempPartDetail.partExercisesNum);
                    $("input[name=partType][value="+tempPartDetail.partType+"]").click();
                    if(tempPartDetail.partType==='1'){
                        partExercisesModelInput.val(tempPartDetail.partTypeDetail);
                    }else{
                        rangeMinInput.val(tempPartDetail.partTypeDetail.rangeMin);
                        rangeMaxInput.val(tempPartDetail.partTypeDetail.rangeMax);
                        $("input[name=containsBrackets][value="
                            +tempPartDetail.partTypeDetail.containsBrackets+"]").prop("checked",true);
                        mathFlagInput.prop("checked",false);
                        $.each(mathFlagInput,function(i,v){
                            var index = $.inArray($(v).val(), tempPartDetail.partTypeDetail.mathFlag);
                            if(index!==-1){
                                $(v).prop("checked",true);
                            }
                        });
                        randomValNumInput.val(tempPartDetail.partTypeDetail.randomValNum);
                    }
                }
            }else{// 否则隐藏大题详情设置区域 并将data-partId置空
                partDetailDiv.hide();
                partDetailDiv.attr("data-partId","");
            }
        });
        // 大题出题方式选择
        $("input[name=partType]").change(function(){
            var id = $(this).attr("id");
            $(".partTypeDiv").hide();
            $("#"+id+"Div").show();
        });
        //  自定义模板方式 便捷拼接四则运算按钮逻辑
        var partExercisesModelInput = $("#partExercisesModel");
        $(".mathFlag").on("click",function(){
            partExercisesModelInput.val(partExercisesModelInput.val()+$(this).text());
            partExercisesModelInput.focus();
        });
        // 限制每道大题中的题目数
        var partExercisesNumInput = $("#partExercisesNum");
        partExercisesNumInput.change(function(){
            if(partExercisesNumInput.val()>pageObj.maxPartExercisesNum){
                partExercisesNumInput.val(pageObj.maxPartExercisesNum);
            }
        });
        // 验证配置
        // 修改提示信息
        $.extend($.validator.messages, {
            required: "此处必填",
            digits: "只能输入整数"
        });
        var validateOpt = {
            // 错误提示位置
            errorPlacement: function(error, element) {
                var flagEle = typeof(element.attr("data-content"))!=="undefined"
                    ?element
                    :$("#"+element.attr("name")+"Span");
                // 用boostrap popover弹出框来提示错误信息
                flagEle.attr("data-content",error.html());
                flagEle.popover('show');
                flagEle.siblings("i").remove();
            },
            // 通过验证后回调
            success: function(label) {
                var flagEleId = label.attr( "for" );
                var input = $("#"+flagEleId);
                var flagEle = input.attr("name")
                    ?$("[name="+input.attr("name")+"]:last")
                    :input;
                // 增加成功提示
                flagEle.after('   <i class="fa fa-check-circle" style="color:#2E8B57;" aria-hidden="true"></i>');
                // 隐藏提示
                flagEle.attr("data-content","");
                flagEle.popover('hide');
            }
        };

        //为 自定义模板 增加自定义验证
        $.validator.addMethod("validatePartExercisesModel",function(value){
            return pageObj.isModalLegal(value);
        },"自定义模板错误");
        validateOpt.rules = {
            partExercisesModel: {
                validatePartExercisesModel: true
            }
        };

        // 将jQuery validate对象存入page对象中，方便其他方法调用
        pageObj.adSFormValidator = $("#advancedSettingsForm").validate(validateOpt);

        // 同时设置testTime的验证
        $("#testTimeForm").validate(validateOpt);
        // 高级设置 区域 显示/隐藏 toggle 逻辑
        $("#advancedSettingsBtn").on("click",function(){
           $("#advancedSettingsForm").toggle();
           var faEle = $("#advancedSettingsBtn .fa");
           if(faEle.hasClass("fa-angle-down")){
               faEle.removeClass("fa-angle-down").addClass("fa-angle-up");
           }else{
               faEle.removeClass("fa-angle-up").addClass("fa-angle-down");
           }
        });
        // 高级设置 保存
        $("#saveSettings").on("click",function(){
            // 验证所有设置是否通过
            if(pageObj.isAllSettingValidate()){
                beAlert("保存将修改当前设置数据，确定保存？","",function(isContinued){
                    if(!isContinued){
                        return;
                    }
                    pageObj.saveSettingData(pageObj.curSettingData);
                    $("#partSelect").val('').change();
                    // 弹出成功提示
                    $.showResultInfo({
                        css:{
                            "position": "fixed",
                            "margin": 0,
                            "right": "-10rem",
                            "bottom": "5rem",
                            "width": "10rem"
                        }
                    });
                }, {type: 'info', showCancelButton:true});
            }
        });

        // 高级设置 重置
        $("#resetSettings").on("click",function(){
            beAlert("重置将会丢失当前设置数据，确定重置？","",function(isContinued){
                if(!isContinued){
                    return;
                }
                pageObj.saveSettingData(pageObj.defSettingData);
                pageObj.adSFormValidator.resetForm();
            }, {type: 'info', showCancelButton:true});

        });

        // 生成、下载、交卷、查看答案、开始考试、暂停考试、继续考试
        $("#gen,#download,#submit,#showAnswer,#startTest,#pauseTest,#resumeTest").on("click",function(){
            //按钮id名与方法名一致，根据id调用对应方法名
            var id = $(this).attr("id");
            if(id && pageObj[id] && !$(this).hasClass("btn_disable")){
                $(this).removeClass("btn_common").addClass("btn_disable");
                pageObj[id]();
                $(this).removeClass("btn_disable").addClass("btn_common");
            }
        });

        //页面离开事件，若未完成试卷，则询问是否离开
        window.onbeforeunload = function () {
            if($('.answer').is(":hidden") && !($('.test-paper-div').is(":hidden") && $('.pauseDiv').is(":hidden"))){
                return "试题还没做完哦，确认放弃？";
            }
        };
    },

    // 获取URL参数工具方法
    /*getUrlParam:function (variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0]===variable){return pair[1];}
        }
        return(false);
    },*/

    // 当前页面使用的配置数据
    curSettingData:{},

    // 默认使用的配置数据
    defSettingData:{
        partNum:3,
        partDetails:[
            {
                partName:'30以内加减法练习',
                partExercisesNum:10,
                partType:'2',
                partTypeDetail:{
                    rangeMin:1,
                    rangeMax:30,
                    containsBrackets:'0',
                    mathFlag:['1','2'],
                    randomValNum:2
                }
            },{
                partName:'10x10乘法表练习',
                partExercisesNum:10,
                partType:'1',
                partTypeDetail:'{n[2,10]}×{n[2,10]}'
            },{
                partName:'附加题',
                partExercisesNum:5,
                partType:'2',
                partTypeDetail:{
                    rangeMin:1,
                    rangeMax:35,
                    containsBrackets:'1',
                    mathFlag:['1','2','3'],
                    randomValNum:3
                }
            }
        ]
    },

    // 验证所有设置是否通过
    isAllSettingValidate:function(){
        var isAllValidate = true;
        $.each($("#partSelect option[value!='']"),function(i,v){
            $("#partSelect").val($(v).val()).change();
            // form()方法判断该表单是否全部通过验证，返回boolean
            var isValidate = pageObj.adSFormValidator.form();
            isAllValidate = isAllValidate && isValidate;
        });
        return isAllValidate;
    },

    // 存入localforage的key
    localSettingDataKey:'customSettingData',

    // 保存配置数据
    saveSettingData:function(settingData){
        // 通过localforage将配置存入浏览器本地存储
        localforage.setItem(pageObj.localSettingDataKey, settingData).then(function(){
            //保存完成后，加载配置数据
            pageObj.loadSettingData();
        });
    },

    // 加载配置数据
    loadSettingData:function(){

        //通过localforage将配置从浏览器本地存储取出，
        localforage.getItem(pageObj.localSettingDataKey,function (err,value) {
            // 将默认数据存入curSettingData
            pageObj.curSettingData = value?value:jQuery.extend(true, {}, pageObj.defSettingData);// 对象深拷贝，否则会互相影响
        }).then(function(){
            // 将curSettingData数据展现在页面上
            $("input[name=partNum]").val(pageObj.curSettingData.partNum).change();
        });
    },

    // 生成的试题数据
    testPaperData:{
        title: "小学数学练习题",
        noDataTip:"暂无试题",
        list:[
            {
                partName: '第一大题',
                partExercises:['3 × 5 = _____',
                                '3 × 5 = _____',
                                '30 × 50 = _____',
                                '30 × 50 = _____']
            }

        ]
    },

    // 获取随机数
    getRandomNum: function(start,end){
        start = eval(start);
        end = eval(end);
        // 防止传入参数错误导致的负数结果
        if(start>end){
            start = end;
        }
        return Math.floor(Math.random()*(end-start+1)+start);
    },

    //判断当前数字是否为质数
    isPrime: function(randomNum){
        for(var i = 2;i<randomNum;i++){
            if(randomNum%i===0){
                return false;
            }
        }
        return true;
    },

    //获取一个非质数随机数
    getRandomNonPrimeNum:function(start,end){
        start = eval(start);
        end = eval(end);
        // 防止传入参数错误导致的负数结果
        if(start>end){
            start = end;
        }
        var randomNum = Math.floor(Math.random()*(end-start+1)+start);
        if(!pageObj.isPrime(randomNum)){
            return randomNum;
        }else{
            return pageObj.getRandomNonPrimeNum(start,end);
        }
    },

    // 随机地在一定范围内获得除数
    getRandomDivisorInRange: function(dividend,start,end){
        if(!dividend){
            return '';
        }
        start = pageObj.getMaxValue(2,start);
        end = pageObj.getMaxValue(end,dividend);
        var divisors = [];
        for(var i = start;i<dividend;i++){
            if(dividend%i===0 && dividend/i<=end){
                divisors.push(i);
            }
        }
        return divisors[pageObj.getRandomNum(0,divisors.length-1)];
    },

    // 判断模板是否正确
    isModalLegal: function(modalStr){
        try{
            eval(pageObj.modal2Exercise(modalStr));
            return true;
        }catch (e) {
            console.log(e);
            return false;
        }
    },

    // 根据模板 生成 一道随机数题目
    modal2Exercise: function(modalStr){
        // 去除空白字符串
        modalStr = modalStr.replace(/\s+/g,"")
                    .replace(/＋/g,"+")
                    .replace(/－/g,"-")
                    .replace(/×/g,"*")
                    .replace(/÷/g,"/")
                    .replace(/（/g,"(")
                    .replace(/）/g,")");
        // 匹配正则
        var reg = /(\{n\[\d+,\d+\]\})/g;
        var exerciseStr = "",// 最终生成的练习题字符串
            tempResults,// exec匹配出的字符串数组
            index = 0,// exec匹配出的字符串数组元素下标
            modalStrPointer = 0;// 用于指明当前匹配到的元素所位于传入参数modalStr的位置指针
        // 开始循环匹配
        for(var i=0;(tempResults=reg.exec(modalStr)) && i<tempResults.length;i++){
            index = reg.lastIndex;// 每一次都要重新赋值tempResults,这样reg.lastIndex属性才会更新
            // 获取匹配到的字符串
            var tempResult = tempResults[i];
            // 解析随机范围
            var rangeArr = tempResult.substring(tempResult.indexOf("[")+1,tempResult.indexOf("]")).split(",");
            // 根据范围生成随机数
            var thisRandomNum = pageObj.getRandomNum(rangeArr[0],rangeArr[1]);
            // 重新拼接进exerciseStr中去
            exerciseStr+= modalStr.substring(modalStrPointer-1,index-tempResult.length)+thisRandomNum;
            // 移动指针
            modalStrPointer+= tempResult.length+1;
        }
        // 若指针未到结尾，则将结尾剩余部分字符串也拼接上去
        if(modalStrPointer<modalStr.length){
            exerciseStr+= modalStr.substring(modalStrPointer);
        }
        return exerciseStr;
    },

    // 获取上一个括号下标
    getLastBracketIndex: function(randomValArr,descFromIndex){
        if(!randomValArr){
            return -1;
        }
        descFromIndex = descFromIndex>(randomValArr.length-1)?(randomValArr.length-1):descFromIndex;
        for(var i=descFromIndex-1;i>=0;i--){
            if(randomValArr[i] && randomValArr[i].bracketType){
                return i;
            }
        }
        return -1;
    },

    // 判断是否处在一对封闭的括号内
    isInBrackets: function(randomValArr,descFromIndex){
        var lastBracketIndex = pageObj.getLastBracketIndex(randomValArr,descFromIndex);
        if(lastBracketIndex>=0
            && randomValArr[lastBracketIndex].bracketType==='1'){
            return true;
        }
        return false;
    },

    // 判断元素后一位运算符是否为乘除运算
    hasMdBehind:function(randomObj){
        if(randomObj){
            return randomObj.sufMathFlag==='*' || randomObj.sufMathFlag==='/';
        }
        return false;
    },

    // 根据元素前后是否有乘除，是否被括号包围来定义该元素的计算优先级
    getRandomValPriority:function(randomValArr, index){
        var randomObj = randomValArr[index];
        var preRandomObj = (index-1)<0?undefined:randomValArr[index-1];
        // 初始计算优先级
        var priority = 1;
        // 若位于括号中
        if(pageObj.isInBrackets(randomObj)){
            priority++;
            // 若本身位于左括号，则仅看自身身后是否有乘除运算符
            if(randomObj.bracketType==='1' && pageObj.hasMdBehind(randomObj)){
                priority++;

            }
            // 若本身位于右括号，则仅看自身身前是否有乘除运算符
            if(randomObj.bracketType==='2' && pageObj.hasMdBehind(preRandomObj)){
                priority++;
            }
        }else{// 未被括号包围，则直接判断前或后是否有乘除
            if(pageObj.hasMdBehind(randomObj) || pageObj.hasMdBehind(preRandomObj)){
                priority++;
            }
        }
        return priority;
    },

    // 获取两者中的较小值
    getMinValue:function(obj1,obj2){
        return obj1>obj2?obj2:obj1;
    },

    // 获取两者中的较大值
    getMaxValue:function(obj1,obj2){
        return obj1<obj2?obj2:obj1;
    },

    // 根据 基本合计、运算符、 随机范围，随机地反推一个数字
    getBackSteppingNumber:function(baseSum,preMathFlag,sufMathFlag,min,max){
        baseSum = eval(baseSum);
        min = pageObj.getMinValue(eval(min),eval(max));
        max = pageObj.getMaxValue(eval(min),eval(max));
        // 如果baseSum为undefined 且 preMathFlag为undefined,直接初始一个值
        if(typeof (baseSum)==='undefined' && typeof (preMathFlag)==='undefined'){
            if(sufMathFlag==='+'){
                return pageObj.getRandomNum(min,Math.floor((max-min)/2) );
            }
            if(sufMathFlag==='-') {
                return pageObj.getRandomNum(Math.floor((max-min)/2),max);
            }
            if(sufMathFlag==='*'){
                return pageObj.getRandomNum(pageObj.getMaxValue(min,2),Math.floor(Math.sqrt(max)));
            }
            if(sufMathFlag==='/'){
                return pageObj.getRandomNonPrimeNum(Math.ceil(min*min),Math.floor(Math.sqrt(max)));
            }
        }
        if(typeof (preMathFlag)==='undefined'){
            if(sufMathFlag==='+'){
                return pageObj.getRandomNum(min,Math.floor((max-baseSum)/2) );
            }
            if(sufMathFlag==='-') {
                return pageObj.getRandomNum(min,Math.floor((baseSum-min)/2));
            }
            if(sufMathFlag==='*'){
                return pageObj.getRandomNum(pageObj.getMaxValue(min,2),Math.floor(Math.sqrt(max/baseSum)));
            }
            if(sufMathFlag==='/'){
                return baseSum*pageObj.getRandomNum(min,Math.floor(max/baseSum));
            }
        }
        max = pageObj.getMaxValue(eval(baseSum),eval(max));
        min = pageObj.getMinValue(eval(baseSum),eval(min));
        if(preMathFlag==='+'){
            return pageObj.getRandomNum(min,Math.floor((max-baseSum)/2) );
        }
        if(preMathFlag==='-') {
            return pageObj.getRandomNum(min,Math.floor((baseSum-min)/2));
        }
        if(preMathFlag==='*'){
            return pageObj.getRandomNum(pageObj.getMaxValue(min,2),Math.floor(Math.sqrt(max/baseSum)));
        }
        if(preMathFlag==='/'){
            return pageObj.getRandomDivisorInRange(baseSum,min,baseSum);
        }
    },

    // 判断当前元素是否为输入参数计算优先级currentPriority对应运算部分的一个起点元素
    isPartStart:function(randomValArr,i,currentPriority){
        return randomValArr[i].priority===currentPriority
            && (!randomValArr[i-1]
                || randomValArr[i-1].priority!==randomValArr[i].priority
                || pageObj.hasMdBehind(randomValArr[i-1]));
    },

    // 判断当前元素是否为输入参数计算优先级currentPriority对应运算部分的一个结尾元素
    isPartEnd:function(randomValArr,i,currentPriority){
        return randomValArr[i].priority===currentPriority
            && (!randomValArr[i+1]
                || randomValArr[i+1].priority!==randomValArr[i].priority
                || pageObj.hasMdBehind(randomValArr[i]));
    },

    // 获取当前元素应该参考的运算部分的结果值
    getPartSum: function(randomValArr,i){
        // 当前元素是否有partSum
        if(randomValArr && i
            && randomValArr[i] && randomValArr[i].partSum){
            return randomValArr[i].partSum;
        }

        // 上一个元素是否有partSum
        if(randomValArr && i && randomValArr[i]
            && (i-1)>=0 && randomValArr[i-1]
            && randomValArr[i-1].priority>=randomValArr[i].priority
            && randomValArr[i-1].partSum){
            return randomValArr[i-1].partSum;
        }

        // 下一个元素是否有partSum
        if(randomValArr && i && randomValArr[i]
            && (i+1)<randomValArr.length && randomValArr[i+1]
            && randomValArr[i+1].priority>=randomValArr[i].priority
            && randomValArr[i+1].partSum){
            return randomValArr[i+1].partSum;
        }
        return undefined;
    },

    // 递归倒推智能生成合理随机数
    getSmartRandomVals:function(randomValArr,currentPriority,min,max){
        // 最小计算优先级
        var minPriority = 1;
        // 用于临时存储 算式部分的运算结果
        var partSum;
        // 用于临时存储 算式部分的起始下标
        var partStart;
        // 遍历randomValArr
        for(var i=0;i<randomValArr.length;i++){
            // 判断当前元素是否无值，以及是否等于当前计算优先级currentPriority
            if(!randomValArr[i].value && randomValArr[i].priority===currentPriority){
                var preMathFlag = randomValArr[i-1] && randomValArr[i-1].partSum?randomValArr[i-1].sufMathFlag:undefined;
                var sufMathFlag = randomValArr[i].sufMathFlag;
                // 判断当前元素是否为输入参数计算优先级currentPriority对应运算部分的一个起点元素
                if(pageObj.isPartStart(randomValArr,i,currentPriority)){
                    partStart = i;
                }

                // 智能获取当前的部分计算结果
                partSum = pageObj.getPartSum(randomValArr,i);

                // 使用倒推方法生成合理随机值
                randomValArr[i].value =
                    pageObj.getBackSteppingNumber(partSum,preMathFlag,sufMathFlag,min,max);

                partSum = preMathFlag?eval(partSum+preMathFlag+randomValArr[i].value):randomValArr[i].value;

                // 将partStart至i范围内的元素的partSum全部更新当前partSum
                for(var j=partStart;j<=i;j++){
                    randomValArr[j].partSum = partSum;
                }
                // 判断当前元素是否为输入参数计算优先级currentPriority对应运算部分的一个结尾元素
                if(pageObj.isPartEnd(randomValArr,i,currentPriority)){
                    partSum = undefined;
                    partStart = undefined;
                }
            }
        }
        if(currentPriority>minPriority){
            return pageObj.getSmartRandomVals(randomValArr,--currentPriority,min,max);
        }
        return randomValArr;
    },

    // 根据规则设定，生成 一道随机题目
    random2Exercise: function(randomObj){
        // 四则运算 符号,并将下标调整成了每个运算符在页面checkbox中所对应的值
        var allMathFlagArr = ['','+','-','*','/'];

        // 需要生成的随机数数量
        var randomValNum = eval(randomObj.randomValNum);

        // 随机数 数组
        // 其中的对象格式为 {value:xx,sufMathFlag:xx,bracketType:xx,rangeMin:xx,rangeMax:xx}
        // value代表所生成的随机值，sufMathFlag代表该数字右侧第一个运算符，
        // bracketType代表其所在位置的括号类型，1为左括号，2为右括号，否则为无括号
        // rangeMin,rangeMax分别为随机数最小、最大值
        var randomValArr = new Array(randomValNum);

        // 先随机生成每个位置的运算符及括号
        for(var i=0;i<randomValArr.length;i++){
            randomValArr[i] = {
                    value: '',
                    sufMathFlag:'',
                    priority:1,
                    partSum:undefined // 代表本部分子式的运算结果
            };

            // 智能生成运算符，不会存在两个连续的乘号或除号
            if(i>0 && pageObj.hasMdBehind(randomValArr[i-1])){
                var tempMathFlag = [];
                $.each(randomObj.mathFlag,function(index,ele){
                    if(ele>=0
                        && ele<allMathFlagArr.length
                        && allMathFlagArr[ele]!=='*'
                        && allMathFlagArr[ele]!=='/'){
                        tempMathFlag.push(ele);
                    }
                });
                randomValArr[i].sufMathFlag
                    = allMathFlagArr[eval(tempMathFlag[pageObj.getRandomNum(0,tempMathFlag.length-1)])];
            }else if(i<randomValArr.length-1){
                randomValArr[i].sufMathFlag
                    = allMathFlagArr[eval(randomObj.mathFlag[pageObj.getRandomNum(0,randomObj.mathFlag.length-1)])];
            }
            //若是最后一位，则不生成运算符
            if(i===randomValArr.length-1){
                randomValArr[i].sufMathFlag = '';
            }

            // 判断是否随机生成括号
            if(randomObj.containsBrackets==='1'){
                var lastBracketIndex = pageObj.getLastBracketIndex(randomValArr,i);
                var lastBracketRandomObj = lastBracketIndex>=0?randomValArr[lastBracketIndex]:undefined;
                // 若已循环到数组结尾
                if(i===randomValArr.length-1) {
                    //判断上一个括号是否为左括号
                    if (lastBracketRandomObj && lastBracketRandomObj.bracketType === '1') {
                        if (lastBracketIndex === 0) {// 若下标为0，则将两头括号去除，退出循环
                            randomValArr[lastBracketIndex].bracketType = undefined;
                            randomValArr[i].bracketType = undefined;
                            break;
                        }
                        //否则在末尾增加一个 右括号
                        randomValArr[i].bracketType = '2';
                    }
                    break;
                }
                // 若上一个左括号与当前下标仅差一位，且上个运算符为*或者/，则当前下标元素不添加括号
                if(lastBracketRandomObj
                    &&lastBracketRandomObj.bracketType==='1'
                    && i-lastBracketIndex===1
                    && pageObj.hasMdBehind(lastBracketRandomObj)){
                    continue;
                }
                // 随机决定当前元素位置是否添加括号，并根据上个括号类型，决定本次括号类型
                if(pageObj.getRandomNum(0,1)===1){
                    randomValArr[i].bracketType = (lastBracketRandomObj && lastBracketRandomObj.bracketType==='1'?'2':'1');
                }
            }
        }

        // 初始化元素的计算优先级
        var arrMaxPriority = 0;
        for(var x=0;x<randomValArr.length;x++){
            randomValArr[x].priority = pageObj.getRandomValPriority(randomValArr,x);
            if(randomValArr[x].priority>arrMaxPriority){
                arrMaxPriority = randomValArr[x].priority;
            }
        }

        // 递归倒推智能生成合理随机数
        randomValArr = pageObj.getSmartRandomVals(randomValArr,arrMaxPriority,randomObj.rangeMin,randomObj.rangeMax);

        // 拼接成字符串返回给调用者
        var exerciseStr = "";
        $.each(randomValArr,function(index,randomObj){
            exerciseStr+= (randomObj.bracketType==='1'?'(':'')
                        +(randomObj.value||'?')
                        +(randomObj.bracketType==='2'?')':'')
                        +(randomObj.sufMathFlag||'');
        });
        return exerciseStr;
    },

    // 生成试题
    gen:function(){

        // 开始生成试卷 方法
        var startGen = function(isContinued){
            if(!isContinued){
                return;
            }

            // 通过模拟操作将当前表单数据 存入 curSettingData
            $("#partSelect").val("").change();
            var advancedSettingsBtn = $("#advancedSettingsBtn");

            // 只有loading区域处于隐藏状态，才可生成新试题
            var loaddingDiv = $(".loading");
            if(loaddingDiv.is(":hidden")){
                loaddingDiv.show();
                // 生成试卷前将查看答案按钮重置为 不可查看状态
                $("#showAnswer").removeClass("btn_common").addClass("btn_disable");

                // 生成试卷
                // 先删除原先试卷中试卷标题以后的所有内容
                var testDivH2 = $(".test-paper-div h2");
                testDivH2.nextAll().remove();
                var testHtml = '';
                var downloadList = [];
                for(var i = 0;i<pageObj.curSettingData.partNum;i++){
                    var partDetail = pageObj.curSettingData.partDetails[i];
                    testHtml+= "<h3>"+(i+1)+"."+partDetail.partName+"</h3>";
                    var tempDownloadDetail = {
                                                partName:partDetail.partName,
                                                partExercises:[]
                                            };
                    for(var j = 0;j<partDetail.partExercisesNum;j++) {
                        var exercise = '';
                        try {
                            if (partDetail.partType === '1') {//自定义模板
                                //若自定义模板不合法，则提示生成失败
                                if (!pageObj.isModalLegal(partDetail.partTypeDetail)) {
                                    throw "illegal modal";
                                }
                                exercise = pageObj.modal2Exercise(partDetail.partTypeDetail);
                            } else {
                                exercise = pageObj.random2Exercise(partDetail.partTypeDetail);
                            }
                            var exerciseStr = exercise.replace(/\s+/g, "")
                                .replace(/\+/g, "＋")
                                .replace(/\-/g, "－")
                                .replace(/\*/g, "×")
                                .replace(/\//g, "÷");
                            exerciseStr = " " + exerciseStr + " = ";

                            testHtml += (j % 2 === 0 ? "<p>" : "")
                                + "<span class=\"exersice\">\n"
                                + "    （" + (j+1) + "）"+exerciseStr+"<input type=\"number\"/>;\n"
                                + "    <span class=\"answer\">&nbsp;<i class=\"fa fa-check-circle\">"
                                + "        </i><i class=\"fa fa-times-circle\"></i>&nbsp;答案："
                                + "          <span class=\"answerValue\">" + eval(exercise) + "</span>"
                                + "    </span>\n"
                                + "</span>"
                                + (j % 2 === 0 ? "" : "</p>");
                            tempDownloadDetail.partExercises.push(exerciseStr + "_____");
                        } catch (e) {
                            console.log("("+(j+1)+")"+exercise);
                            console.log(e);
                            loaddingDiv.hide();
                            if(!advancedSettingsBtn.is(":hidden")){
                                advancedSettingsBtn.click();
                            }
                            $.showResultInfo({
                                info: "生成失败!",
                                type: "danger",
                                css: {
                                    "position": "fixed",
                                    "margin": 0,
                                    "right": "-10rem",
                                    "bottom": "5rem",
                                    "width": "10rem"
                                }
                            });
                            return;
                        }
                    }
                    downloadList.push(tempDownloadDetail);
                }
                pageObj.testPaperData.list = downloadList;
                testDivH2.after(testHtml);
                // 试卷生成后隐藏loadding
                loaddingDiv.hide();
                // 弹出成功提示
                $.showResultInfo({
                    css:{
                        "position": "fixed",
                        "margin": 0,
                        "right": "-10rem",
                        "bottom": "5rem",
                        "width": "10rem"
                    }
                });
                if(!$("#advancedSettingsForm").is(":hidden")){
                    advancedSettingsBtn.click();
                }
                // 下载、开始按钮解除禁用状态
                $("#download,#startTest").removeClass("btn_disable").addClass("btn_common");
                // 交卷按钮 恢复禁用
                $("#submit").removeClass("btn_common").addClass("btn_disable");
                // 显示开始按钮，隐藏暂停/恢复按钮
                $("#startTest").show();
                $("#pauseTest,#resumeTest").hide();
                // 隐藏试卷区，隐藏暂停区
                $(".test-paper-div,.pauseDiv").hide();
                // 倒计时停止,隐藏倒计时
                var countDownDiv = $('#countDown');
                if(!countDownDiv.is(":hidden")){
                    countDownDiv.countdown('stop').hide();
                }
                // 恢复 查看答案 按钮前的分钟计时
                // 判断是否设置了考试时间，若有，则按照设置时间显示
                if($("#setTestTime").is( ":checked" )){
                    $("#testTimeSpan2").html($("#testTime").val());
                }else{//若无，则按默认时间显示
                    $("#testTimeSpan2").html(pageObj.defaultTestTime);
                }
                // 隐藏上回考试结果
                $("#testResult").hide();
            }
        };

        // 验证所有设置是否通过
        if(pageObj.isAllSettingValidate()){
            // 若当前试卷未完成，则询问是否放弃当前测试
            if($('.answer').is(":hidden") && !($('.test-paper-div').is(":hidden") && $('.pauseDiv').is(":hidden"))){
                beAlert("当前试卷未完成，是否继续生成新试卷？","",startGen, {type: 'info', showCancelButton:true});
            }else{
                // 生成新试卷
                startGen(true);
            }
        }
    },

    // 下载
    download: function(){
        var docStr = baidu.template('docScript', pageObj.testPaperData);
        XDoc.to(docStr, "docx", {'_filename':'小学数学练习题'}, "_blank");
    },

    // 交卷
    submit:function(){
        beAlert("确定交卷？","",function(isContinued){
            if(!isContinued){
                return;
            }
            // 判卷
            var correctNum = 0,wrongNUm = 0,total = 0;
            $.each($(".test-paper-div .exersice"),function(i,v){
                var input = $(v).find("input:eq(0)");
                var answer = $(v).find(".answerValue:eq(0)");
                if(eval(input.val())===eval(answer.html())){
                    $(v).addClass("correct");
                    correctNum++;
                }else{
                    $(v).addClass("wrong");
                    wrongNUm++;
                }
                total++;
            });
            // 显示考试结果
            var resultHtml = '共'+total+'题，答对'+correctNum+'题，答错'+wrongNUm+'题，'
                +'正确率'+(correctNum/total*100).toFixed(2)+'%';
            $("#testResult").html(resultHtml).show();
            // 显示试卷区，隐藏 暂停区
            $(".test-paper-div").show();
            $(".pauseDiv").hide();
            // 展示答案
            pageObj.showAnswer();
        }, {type: 'info', showCancelButton:true});
    },

    // 查看答案
    showAnswer:function(){
        $(".answer").show();
        // 倒计时停止,隐藏倒计时
        $('#countDown').countdown('stop').hide();
        // 显示开始按钮，隐藏暂停、恢复按钮
        $("#startTest").show();
        $("#pauseTest,#resumeTest").hide();
        // 将交卷、开始考试、下载、重置为初始状态
        $("#submit,#startTest,#download").removeClass("btn_common").addClass("btn_disable");

        // 查看答案按钮 恢复禁用
        $("#showAnswer").removeClass("btn_common").addClass("btn_disable");
    },

    // 开始在线考试
    startTest:function(){
        // 隐藏开始按钮、展示暂停按钮
        $("#startTest,#pauseTest").toggle();
        var finalTime = new Date().getTime();
        // 判断是否设置了考试时间，若有，则按照设置时间显示
        if($("#setTestTime").is( ":checked" )){
            finalTime+= eval($("#testTime").val())*60*1000;
        }else{// 若无，则按默认时间显示
            finalTime+= pageObj.defaultTestTime*60*1000;
        }
        var countDownDiv = $('#countDown');
        countDownDiv.show();

        // 开启倒计时插件，倒计时结束后或交卷后方可查看答案
        countDownDiv.countdown(finalTime).on('update.countdown', function(event) {
            $('#countDown').html(event.strftime('%H:%M:%S'));
            $("#testTimeSpan2").html(event.offset.minutes);
        }).on('finish.countdown', function(event) {
            $('#countDown').html(event.strftime('%H:%M:%S'));
            // 查看答案 解除禁用
            $("#showAnswer").removeClass("btn_disable").addClass("btn_common");
            // 暂停按钮 隐藏
            $("#pauseTest").hide();
        });

        // 显示试题区域
        $(".test-paper-div").show();

        // 解除交卷按钮的禁用
        $("#submit").removeClass("btn_disable").addClass("btn_common");
    },

    // 暂停
    pauseTest:function(){
        $(".test-paper-div,.pauseDiv").toggle();
        $('#countDown').countdown('toggle');
    },

    // 恢复
    resumeTest:function(){
        $(".test-paper-div,.pauseDiv").toggle();
        $('#countDown').countdown('toggle');
    }

};

// 页面执行入口
$(function(){
    pageObj.init();
});
