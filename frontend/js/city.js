 // 讀取Json到地區選項
        $(function () {
            // 載入資料
            $.ajax({
                type: "GET",
                url: "js/CityCountyData.json",
                dataType: "json",
                success: showdata,
                error: function () {
                    console.log("連線錯誤");
                }
            });
        });


        function showdata(data) {
            // console.log(data);
            $('#s09-city').empty().append(`<option value="" disabled selected>---所在地區---</option>`);
            //    方法二:使用forEach拜訪每一筆資料,不用設定for i的最大值
            data.forEach((item, key) => {

                let myimg;
                myimg = item.CityName
                console.log(myimg);
                //使用jquery語法將opendata內的JSON內容帶入每列 
                let strHTML = `<option value="">${myimg}</option>`

                // 取得html中的id值=mybody,疊加107次strHTML
                $("#s09-city").append(strHTML);

            });
        }