let next = {
    then(res) {
        console.log(res)

        if(res.msg == 'ok'){
            if(res.data.dbmsg == "ok")
            {
                window.location = "account.html?id="+res.id
            }
            else
            {
                let err_msg = dbmsgs[res["data"]["dbmsg"]]
                alert(err_msg)
            }
        }
        else {
            alert(smsgs[res.msg])
        }
    },
    catch(err)
    {
        alert(err)
        console.log(err)
    }
}
let login = new Vue({
    el: "#login",
    data: {
        // "login-tab" for login, 
        // "register-tab" for register
        selected: "login-tab",
        input: {
            id:"",
            priv_key:"",
            name:""
        }
     },
    methods: {
        switch_tab(event) {
            console.log("Switch tab to " + event.currentTarget.id)
            this.selected = event.currentTarget.id
        },
        register() {
            let res = register_call(this.input.id, this.input.priv_key, this.input.name, this.input.sex, this.input.lover_id, next)
        },
        login() {
            let res = login_call(this.input.id, this.input.priv_key, next)
        }
    }
})