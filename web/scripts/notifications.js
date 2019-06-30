let vue = new Vue({
    el: "#notifications",
    data: {
        avatar: "res/imgs/img1.jpg",
        cur_tab: "my_proposals",
        my_proposals: [{
            name: "笔记本1",
            desc: "My first notebook proposal",
            authed: ["zf"],
            rejeted: [],
            unauthed: ["cwk"],
        }],
        unauthed_proposals: [{
            name: "笔记本2",
            creator: "cwk",
            desc: "FLXG",
            authed: ["cwk"],
            rejeted: [],
            unauthed: ["zf"]
        }],
        friend_proposals: [
            "cwk"
        ],
        avatar_dict: {
            "cwk": "res/imgs/img1.jpg",
            "zf": "res/imgs/img2.jpg"
        }
    },
    methods: {
        change_tab: function(e) {
            this.cur_tab = e.currentTarget.id
        }
    }
})