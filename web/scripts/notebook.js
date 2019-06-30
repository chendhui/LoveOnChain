var notebook = new Vue({
    el: "#notebook",
    data: {
        info:{
            name:"u1",
			desc:"hhh",
            authors:{
                name:"u1",
                avatar:"res/imgs/img1.jpg"
            }
        },
		account_info: {
            name: "Î´µÇÂ¼",
            avatar: "res/imgs/img1.jpg",
        },
        contents:[]

    },
    methods:{
        get_notebook(){
            let params  = window.location.search.substring(1).split('&')
            let para_dict = new Array()
            for(var i in params){
                let p = params[i].split('=')
                para_dict[p[0]] = p[1]
            }
            let id = para_dict["id"]
			let name = para_dict["name"]
			let desc = para_dict["desc"]
            let that = this
			//that.info = {name:"u1",author:{name:"u1",avatar:"res/imgs/img1.jpg"}
            let next = {
                then(res) {
					that.info = {"name": name, "desc": desc, "authors": res.authors}
					console.log(res)
					that.contents = res.contents
				/***
                    if(res.msg != "ok") {
                        alert(smsgs[res.msg])
                    }
                    else if(res.data.info.dbmsg != "ok"){
                        alert(dbmsgs[res.data.info.dbmsg])
                    }
                    else
                    {
                        that.info = res.data.info.data
                        that.contents = res.data.preview.data
                        console.log(this.info, this.contents)
                    }
				***/
                },
                catch(err) {
                    console.log(err)
                    alert(err)
                }
            }
            //client.get_notebook_info(id, next)
			getNotebook_call(id, next)
        }
    }
})
notebook.get_notebook()