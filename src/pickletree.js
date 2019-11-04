//Pickle tree component created by Kadir Barış Bozat

class PickleTree {
    /**
     * 
     * @param {object} obj as tree object 
     */
    constructor(obj) {
        console.log('tree started');
        //start status is collapsed or not
        this.StartStatus = obj.c_startStatus;
        //logs are open or close
        this.LogMode = obj.c_logMode;
        //switch mode
        this.SwitchMode = obj.c_switchMode;
        //target div id
        this.Target = obj.c_target;
        //building area
        this.Area = '';
        //available nodes list
        this.NodeList = [];
        //row create callback
        this.rowCreateCallback = obj.rowCreateCallback;
        //draw callback
        this.drawCallback = obj.drawCallback;
        //switch callback
        this.switchCallback = obj.switchCallback;
        //tree json data
        this.Data = obj.c_data;
        //build tree
        this.build();
    }


    //#region Helper Methods

    /**
     * 
     * @param {string} message for log messages
     */
    log(message) {
        if (this.LogMode) {
            console.log(message);
        }
    }

    /**
     * Building main details
     */
    build() {
        document.getElementById(this.Target).innerHTML = '<ul id="tree_picklemain"></ul>';
        this.Area = document.getElementById('tree_picklemain');
        this.log('tree build started..');
        this.drawData();
    }

    /**
     * 
     * @param {integer} id node id for finding node 
     */
    getNode(id) {
        this.log('node returned..');
        //return node
        return this.NodeList.find(x => x.id === 'node_' + id);
    }

    /**
     * set child nodes for parent node
     * @param {object} node 
     */
    setChildNodes(node) {
        //update node parent
        for (let i = 0; i < this.NodeList.length; i++) {
            //if is parent pust to his childs
            if (this.NodeList[i].id === node.parent.id) {
                this.NodeList[i].childs.push(node.id);
                //show icon for childs
                document.getElementById('i_' + this.NodeList[i].id).style.display = '';
            }
        }
    }

    //#endregion

    //#region Node Events
    /**
     * get child nodes list of node
     * @param {object} node 
     */
    getChilds(node) {
        let list = [];
        for (let i = 0; i < this.NodeList.length; i++) {
            if (node.childs.includes(this.NodeList[i].id)) {
                list.push(this.getNode(this.NodeList[i].id));
            }
        }
        this.log('node childs returned..');
        return list;
    }

    /**
     * toggle open or close node childs
     * @param {object} node 
     */
    toggleNode(node) {
        let ie = document.getElementById('i_' + node.id);
        let ule = document.getElementById('c_' + node.id);
        if (node.childStatus) {
            //change icon
            ie.classList.remove('fa-minus');
            ie.classList.add('fa-plus');
            //hide element
            ule.style.display = 'none';
        } else {
            //change icon
            ie.classList.remove('fa-plus');
            ie.classList.add('fa-minus');
            //show element
            ule.style.display = '';
        }

        //change node status
        for (let i = 0; i < this.NodeList.length; i++) {
            this.NodeList[i].childStatus = !this.NodeList[i].childStatus;
        }
        this.log('node toggled..');
    }

    /**
     * remove node from dom
     * @param {object} node 
     */
    deleteNode(node) {
        console.log(node);
        let elm = document.getElementById(node.id);
        if (node.childs.length > 0) {
            for (let i = 0; i < node.childs.length; i++) {
                this.deleteNode(this.getNode(node.childs[i]));
            }
        }
        elm.parentNode.removeChild(elm);
        this.log('node removed..(' + node.id + ')');
    }

    //#endregion



    /**
     * creating node
     * @param {string} n_title 
     * @param {string} n_id 
     * @param {htmlobjects} n_elements 
     * @param {node object} p_parentNode 
     */
    createNode(n_title = 'new node', n_id, n_elements = [], p_parentNode = { id: 0 }) {
        n_id = n_id === null ? Date.now() : n_id;
        let node = {
            //node value
            value: n_id,
            //node id
            id: 'node_' + n_id,
            //node title
            title: n_title,
            //node html elements
            elements: n_elements,
            //node parent element
            parent: p_parentNode,
            //node child element ids
            childs: [],
            //childs status (child list opened or not)
            childStatus: this.StartStatus,
            //check status for node
            checkStatus: false,
            //this method will return child nodes
            getChilds: () => this.getChilds(node),
            //this method will remove node from dom
            deleteNode: () => this.deleteNode(node)

        }

        //node is added to container
        this.NodeList.push(node);
        //node is drawed
        this.drawNode(node);
        //logged
        this.log('Node is created (' + node.id + ')');
        //node is returned
        return node;
    }

    /**
     * 
     * @param {object} node object for creating html element
     */
    drawNode(node) {
        let icon = 'fa-plus';
        let style = 'none;';
        if (this.StartStatus) {
            icon = 'fa-minus';
            style = '';
        }

        //#region elements

        //node li item
        let li_item = document.createElement("li");
        //node a item
        let a_item = document.createElement("a");
        //node i item
        let i_item = document.createElement("i");
        //node ul item
        let ul_item = document.createElement("ul");

        //set i item id
        i_item.id = 'i_' + node.id;
        //set i item style
        i_item.style.color = 'black';
        //set i item icon
        i_item.classList.add('fa');
        i_item.classList.add(icon);
        i_item.style.display = 'none';

        //set ul item id
        ul_item.id = 'c_' + node.id;
        //set ul item style
        ul_item.style.display = style;

        //set a item id
        a_item.id = 'a_toggle_' + node.id;
        //set i tag to a item
        a_item.appendChild(i_item);
        //set a item href
        a_item.href = 'javascript:;';
        //set a_item title
        a_item.innerHTML += ' ' + node.title;

        //set li item id
        li_item.id = node.id;
        //set a tag to li item
        li_item.appendChild(a_item);


        //set switch to li item if user is wanted
        if (this.SwitchMode) {
            let sw_item = document.createElement('label');
            let ck_item = document.createElement('input');
            let spn_item = document.createElement('span');
            spn_item.classList.add('slider');
            spn_item.classList.add('round');
            ck_item.type = 'checkbox'
            sw_item.classList.add('switch');

            sw_item.appendChild(ck_item);
            sw_item.appendChild(spn_item);

            //id definitions
            ck_item.id = 'ck_' + node.id;
            sw_item.id = 'sw_' + node.id;

            ck_item.value = node.value;
            
            //switch is added to li element
            li_item.appendChild(sw_item);
        }

        //set ul tag to li item
        li_item.appendChild(ul_item);

        //#endregion

        //if is main node
        if (node.parent.id === 0) {
            //put item to area
            this.Area.appendChild(li_item);
        } else {
            //if has parent set to parents childs
            this.setChildNodes(node);
            //then put item
            document.getElementById('c_' + node.parent.id).appendChild(li_item)
        }
        //toggle event for node
        document.getElementById('a_toggle_' + node.id).addEventListener('click', e => {
            //toggle item childs
            this.toggleNode(this.getNode(e.currentTarget.parentElement.id.split('node_')[1]));
        });

        //switch event for node
        if (this.SwitchMode) {
            document.getElementById('ck_' + node.id).addEventListener('click', e => {
                //change node checked data

                for (let i = 0; i < this.NodeList.length; i++) {
                    this.NodeList[i].checkStatus = e.currentTarget.checked ? true : false;
                }
                //trigger callback if exists
                if (typeof this.switchCallback == "function") this.switchCallback(this.getNode(e.currentTarget.parentElement.id.split('node_')[1]));
            });
        }

        //draw callback  method
        if (typeof this.rowCreateCallback == "function") this.rowCreateCallback(node);
    }

    /**
     * this method will draw multiple data 
     */
    drawData() {
        //if data is exist
        if (this.Data.length > 0) {
            //first reshape data
            let order = (list, p = { id: 0, Child: [] }, tree = []) => {
                let childrens = list.filter(y => y.parentid === p.id);
                if (childrens.length > 0) {
                    if (p.id === 0) {
                        tree = childrens;
                    } else {
                        p['Child'] = childrens
                    }
                    for (let i = 0; i < childrens.length; i++) {
                        order(list, childrens[i]);
                    }
                }
                return tree;
            }

            //then create nodes
            let set = (list) => {
                for (let i = 0; i < list.length; i++) {
                    this.createNode(list[i].title, list[i].id, [], this.getNode(list[i].parentid));
                    if (list[i].Child) {
                        set(list[i].Child);
                    }
                }
            }
            //start chain
            set(order(this.Data));

        }
        //start drawcallback
        this.drawCallback();

    }







}