var account = new Vue({
    el: "#account",
    data: {
        account_info: {
            name: "未登录",
            avatar: "res/imgs/img1.jpg",
            friends: [],
            notebooks: []
        },
        input: {
            new_notebook_modal:
            {
                id: "",
                name: "",
                desc: "",
                mode: ""
            },
            new_friend_modal:
            {
                id: ""
            }
        },
        current_page: 1,
        notebooks_perpage: 10
    },
    methods: {
        v_check_syntax(type, input) {
            return check_syntax(type, input)
        },
        create_notebook() {
            if(!check_syntax("notebook_name", this.input.new_notebook_modal.name) || 
                !check_syntax("notebook_id", this.input.new_notebook_modal.name))
            {
                alert("请检查输入！")
                return
            }
            let next = {
                then(res) {
                    if(res.msg!="ok")
                    {
                        alert(smsgs[res.msg])
                    }
                    else if(res.data.dbmsg!="ok")
                    {
                        alert(smsgs[res.data.dbmsg])
                    }
                    else
                    {
                        alert('笔记本创建成功')
                        this.get_my_info()
                        $("#new-notebook-modal").modal('hide')
                    }
                   
                },
                catch(err) {
                    console.log(err)
                    alert(err)
                }
            }
            client.create_notebook("", this.input.new_notebook_modal.id, this.input.new_notebook_modal.mode,
                this.input.new_notebook_modal.name, this.input.new_notebook_modal.desc, next)
            
        },
        get_my_info() {
			let params  = window.location.search.substring(1).split('&')
            let para_dict = new Array()
            for(var i in params){
                let p = params[i].split('=')
                para_dict[p[0]] = p[1]
            }
            let id = para_dict["id"]
			
            let that = this

            let next = {
                then(res) {

				that.account_info = res
				console.log(res.notebooks)
				
				/***
                    if (res.msg == "ok") {
                        if (res.data.dbmsg == "ok") {
                            console.log(res)
                            that.account_info = res.data.data
                        }
                        else {
                            alert(dbmsgs[res.data.dbmsg])
                        }
                    }
                    else {
                        alert(smsgs[res.msg])
                    }
				***/
                },
                catch(err) {
                    console.log(err)
                }
				
            }
            //client.get_my_account_info("u1", next)
			get_my_account_info_call(id, next)
        }
    }
})
account.get_my_info()