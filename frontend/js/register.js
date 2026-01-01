//會員註冊監聽
        $(function () {
            let flag_r_username = false;
            let flag_r_password = false;
            let flag_r_retype_password = false;
            let timer = null;
            let flag_l_username = false;
            let flag_l_password = false;

             //檢查toekn是否存在和合法
            checkLoginStatus();

            //及時監聽 #r-username
            $("#r-username").on("input", function () {
                // 防止多次連續觸發
                clearTimeout(timer);

                timer = setTimeout(() => {
                    if ($(this).val().length > 0 && $(this).val().length < 9) {
                        let username = $(this).val();

                        // 傳遞至後端驗證帳號是否存在
                        axios.post('/api/checkuni',
                            {
                                username: username
                            })
                            .then(function (response) {
                                console.log(response);
                                if (response.data.status) {
                                    $("#r-username").removeClass("is-invalid");
                                    $("#r-username").addClass("is-valid");
                                    $("#r-username-valid-feedback").text(response.data.message);
                                    flag_r_username = true;
                                } else {
                                    $("#r-username").removeClass("is-valid");
                                    $("#r-username").addClass("is-invalid");
                                    $("#r-username-invalid-feedback").text(response.data.message);
                                    flag_r_username = false;
                                }
                            })
                            .catch(function (error) {
                                console.log(error);
                            })
                            .finally(function () {
                                // always executed
                            });
                    } else {
                        $(this).removeClass("is-valid");
                        $(this).addClass("is-invalid");
                        $("#r-username-invalid-feedback").text("帳號不符合規定!");
                        flag_r_username = false;
                    }
                }, 500);
            });

            //即時監聽 #r-password
            $("#r-password").on("input", function () {
                // 確認密碼顯示不符合規定
                $("#r-retype-password").removeClass("is-valid");
                $("#r-retype-password").addClass("is-invalid");
                flag_r_retype_password = false;

                if ($(this).val().length > 0 && $(this).val().length < 9) {
                    $(this).removeClass("is-invalid");
                    $(this).addClass("is-valid");
                    flag_r_password = true;
                } else {
                    $(this).removeClass("is-valid");
                    $(this).addClass("is-invalid");
                    flag_r_password = false;
                }
            })
            //及時監聽 #r-retype-password
            $("#r-retype-password").on("input", function () {
                if ($(this).val() == $("#r-password").val()) {
                    // 確認密碼符合
                    $(this).removeClass("is-invalid");
                    $(this).addClass("is-valid");
                    flag_r_retype_password = true;
                } else {
                    //確認密碼不符合
                    $(this).removeClass("is-valid");
                    $(this).addClass("is-invalid");
                    flag_r_retype_password = false;
                }
            });
            // 監聽按鈕 #r-btn-ok
            $("#r-btn-ok").on("click", function () {
                if (flag_r_username && flag_r_password && flag_r_retype_password) {
                    //傳遞至後端執行註冊
                    //整理傳遞給後端的json格式資料
                    // let jsonDATA = {};
                    // jsonDATA["username"] = $("#r-username").val();
                    // jsonDATA["password"] = $("#r-password").val();

                    // axios.post('http://127.0.0.1:5000/api/register', JSON.stringify(jsonDATA),
                    //     {

                    //     })
                    //     .then(function (response) {
                    //         console.log(response);
                    //     })
                    //     .catch(function (error) {
                    //         console.log(error);
                    //     })
                    //     .finally(function () {
                    //         // always executed
                    //     });

                    // 方法二
                    let jsonDATA = {
                        username: $("#r-username").val(),
                        password: $("#r-password").val()
                    }

                    axios.post('/api/register', jsonDATA)
                        .then(function (response) {
                            console.log(response);
                            if (response.request.status == 200) {
                                Swal.fire({
                                    title: "註冊成功!",
                                    showDenyButton: false,
                                    showCancelButton: false,
                                    confirmButtonText: "確認",
                                    denyButtonText: `Don't save`,
                                    icon: "success"
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        //關閉modal所有的功能
                                        bootstrap.Modal.getOrCreateInstance("#registerModal").hide();

                                        //清空欄位 重新觸發驗證行為
                                        $("#r-username").val('').trigger('input');
                                        $("#r-password").val('').trigger('input');
                                        $("#r-retype-password").val('');
                                    }
                                });
                            }
                        })
                        .catch(function (error) {
                            console.log(error);
                        })
                        .finally(function () {
                            // always executed
                        });



                } else {
                    Swal.fire({
                        title: "欄位錯誤!",
                        icon: "error"
                    });
                }
            });

            //#l-username 監聽
            $("#l-username").on("input", function () {
                // 帳號長度正確
                if ($(this).val().length > 0 && $(this).val().length < 9) {
                    $(this).removeClass("is-invalid");
                    $(this).addClass("is-valid");
                    flag_l_username = true;
                } else {
                    $(this).removeClass("is-valid");
                    $(this).addClass("is-invalid");
                    flag_l_username = false;
                }
            })

            //#l-password 監聽
            $("#l-password").on("input", function () {

                if ($(this).val().length > 0 && $(this).val().length < 9) {
                    $(this).removeClass("is-invalid");
                    $(this).addClass("is-valid");
                    flag_l_password = true;
                } else {
                    $(this).removeClass("is-valid");
                    $(this).addClass("is-invalid");
                    flag_l_password = false;

                }
            });

            //#l-btn-ok 按鈕監聽
            $("#l-btn-ok").on("click", function () {
                if (flag_l_username && flag_l_password) {
                    //傳遞至後端執行登入驗證
                    axios.post('/api/login', {
                        username: $("#l-username").val(),
                        password: $("#l-password").val()
                    })
                        .then(function (response) {
                            console.log(response);
                            if (response.data.status) {
                                Swal.fire({
                                    title: response.data.message,
                                    showDenyButton: false,
                                    showCancelButton: false,
                                    icon: "success",
                                    confirmButtonText: "確認",
                                    denyButtonText: `Don't save`
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        //登入驗證成功
                                        //loginModal 關閉
                                        bootstrap.Modal.getOrCreateInstance("#loginModal").hide();

                                        //顯示登入後的UI畫面
                                        setLoginUI(response.data.username);

                                        //將token 寫入 cookie
                                        setCookie("uid", response.data.token, 7);

                                        //寫入localstorage
                                        localStorage.setItem("uid", response.data.token)
                                    }
                                });
                            } else {
                                //登入驗證失敗
                                Swal.fire({
                                    title: response.data.message,
                                    showDenyButton: false,
                                    showCancelButton: false,
                                    confirmButtonText: "確認",
                                    denyButtonText: `Don't save`
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        //loginModal 關閉
                                        bootstrap.Modal.getOrCreateInstance("#loginModal").hide();
                                        // $("#l-username").val('');
                                        // $("#l-password").val('');
                                    }
                                });

                            }
                        })
                        .catch(function (error) {
                            console.log(error);
                        })
                        .finally(function () {
                            // always executed
                        });

                } else {
                    Swal.fire({
                        title: "登入欄位錯誤!",
                        icon: "error"
                    });
                }
            });
            
            // 登出按鈕監聽
             $("#s02-logout-btn").on("click", function () {
                     clearLoginUI();          
                    //清除localstorage
                    localStorage.removeItem("uid");
             });

            //控制台按鈕監聽
            $("#s02-control-panel-btn").on("click",function(){
                // window.location.href = "20251218-SPA-member-control-panel-api.html"; 

                //另開分頁
                window.open("20251228-SPA-member-control-panel-api.html","_blank");
                

            });
        });

        function checkLoginStatus() {
            let token = localStorage.getItem("uid")
            if (!token) {
                console.log("沒有token!");
            }

            // Optionally the request above could also be done as
            axios.get('/api/me', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(function (response) {
                    console.log(response);
                    //token驗證成功
                    setLoginUI(response.data.username);

                })
                .catch(function (error) {
                    console.log(error);
                })
                .finally(function () {
                    // always executed
                });

        }

        // w3c 設定和取得cookie
        function setCookie(cname, cvalue, exdays) {
            const d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            let expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }

        function getCookie(cname) {
            let name = cname + "=";
            let decodedCookie = decodeURIComponent(document.cookie);
            let ca = decodedCookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        }

        function setLoginUI(username) {
            // s02 登入與註冊按鈕消失
            $("#s02-login-btn").addClass("d-none");
            $("#s02-register-btn").addClass("d-none");
            // 登入後顯示會員名稱
            $("#s02-member-span").removeClass("d-none");
            $("#s02-member-span").html(`會員: <span class="text-03 fw-900 h2">${username}</span>`);
            // 顯示登出按鈕
            $("#s02-logout-btn").removeClass("d-none");
            // 顯示控制台按鈕
            $("#s02-control-panel-btn").removeClass("d-none");
        }
        function clearLoginUI() {
            // s02 登入與註冊按鈕顯示
            $("#s02-login-btn").removeClass("d-none");
            $("#s02-register-btn").removeClass("d-none");
            // 取消登入會員消息
            $("#s02-member-span").addClass("d-none");
             //取消登出按鈕
            $("#s02-logout-btn").addClass("d-none");
            // 取消控制台按鈕
            $("#s02-control-panel-btn").addClass("d-none");
        }