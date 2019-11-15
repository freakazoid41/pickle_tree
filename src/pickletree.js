//Pickle tree component created by Kadir Barış Bozat

class PickleTree {
    /**
     * 
     * @param {object} obj as tree object 
     */
    constructor(obj) {
        console.log('tree started');
        //target div id
        this.target = obj.c_target;
        //building area
        this.area = '';
        //available nodes list
        this.nodeList = [];
        //row create callback
        this.rowCreateCallback = obj.rowCreateCallback;
        //draw callback
        this.drawCallback = obj.drawCallback;
        //switch callback
        this.switchCallback = obj.switchCallback;
        //tree json data
        this.data = obj.c_data;
        //build tree
        this.build(obj.c_config);
    }


    //#region Helper Methods

    /**
     * 
     * @param {string} message for log messages
     */
    log(message) {
        if (this.config.logMode) {
            console.log(message);
        }
    }

    /**
     * Building main details
     */
    build(c_config) {
        let config = {
            //logs are open or close
            logMode: false,
            //switch mode
            switchMode: false,
            //family mode
            familyMode: false,
            //fold icon
            foldedIcon: 'fa fa-plus',
            //unfold icon
            unFoldedIcon: 'fa fa-minus',
            //start status is collapsed or not
            foldedStatus: false,

        }

        //check config here!!
        for (let key in c_config) {
            config[key] = c_config[key];
        }


        //set config data
        this.config = config;


        document.getElementById(this.target).innerHTML = '<ul id="tree_picklemain"></ul>';
        this.area = document.getElementById('tree_picklemain');
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
        return this.nodeList.find(x => x.id === 'node_' + id);
    }

    /**
     * set child nodes for parent node
     * @param {object} node 
     */
    setChildNodes(node) {
        //update node parent
        for (let i = 0; i < this.nodeList.length; i++) {
            //if is parent pust to his childs
            if (this.nodeList[i].id === node.parent.id) {
                this.nodeList[i].childs.push(node.id);
                //show icon for childs
                document.getElementById('i_' + this.nodeList[i].id).style.display = '';
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
        for (let i = 0; i < this.nodeList.length; i++) {
            if (node.childs.includes(this.nodeList[i].id)) {
                list.push(this.getNode(this.nodeList[i].id));
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
        if (node.childs.length > 0) {
            let ie = document.getElementById('i_' + node.id);
            let ule = document.getElementById('c_' + node.id);
            if (node.foldedStatus === false) {
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
            node.foldedStatus = !node.foldedStatus;
            //change node status
            for (let i = 0; i < this.nodeList.length; i++) {
                if (this.nodeList[i].id === node.id) {
                    this.nodeList[i].foldedStatus = node.foldedStatus;
                }
            }
            this.log('node toggled..');
        } else {
            this.log('node not has childs...!');
        }
    }

    /**
     * remove node from dom
     * @param {object} node 
     */
    deleteNode(node) {
        let elm = document.getElementById(node.id);
        if (node.childs.length > 0) {
            for (let i = 0; i < node.childs.length; i++) {
                this.deleteNode(this.getNode(node.childs[i]));
            }
        }
        elm.parentNode.removeChild(elm);
        this.log('node removed..(' + node.id + ')');
    }

    /**
     * this method will check node and its family.
     * @param {object} node 
     */
    checkNode(node) {
        //change node checked data
        for (let i = 0; i < this.nodeList.length; i++) {
            this.nodeList[i].checkStatus = node.checkStatus;
        }
        //then if is checked and folded unfold and open childs
        if (node.checkStatus && node.childs.length > 0) {
            //make element looks like is folded
            node.foldedStatus = true;
            this.toggleNode(node);
        }
        //trigger callback if exists
        if (typeof this.switchCallback == "function") this.switchCallback(node);
        //check html element if family mode is open
        if (this.config.familyMode) {
            document.getElementById('ck_' + node.id).checked = node.checkStatus;
        }
    }

    /**
     * this method will check node childs and his parents if not checked.
     * @param {object} node 
     */
    checkNodeFamily(node) {
        let parentCheck = async(node) => {
            //first check if has parent
            if (node.parent.id !== 0) {
                //then get parent node
                node = node.parent;
                //change parent node status
                node.checkStatus = true;
                //check parent node
                this.checkNode(node);
                //then restart process
                parentCheck(node);
            }
        }


        let childCheck = async(node) => {
            //first check main node
            this.checkNode(node);
            //then check childs if exist
            if (node.childs.length > 0) {
                //foreach child
                for (let i = 0; i < node.childs.length; i++) {
                    //restart process
                    childCheck(this.getNode(node.childs[i].split('_')[1]));
                }
            }
        }

        childCheck(node);
        if (node.checkStatus) parentCheck(node);
    }

    /**
     * this method will unfold all parents of node 
     * @param {object} node 
     */
    async showFamily(node) {
        //check if has parent
        if (node.parent.id !== 0) {
            //then make node status closed
            node.parent.foldedStatus = true;
            //after send parent node for toggle
            this.toggleNode(node.parent);
            //make recursive for another parents
            this.showFamily(node.parent);
        }

    }

    //#endregion



    /**
     * creating node
     * @param {object} obj
     */
    createNode(obj) {
        obj.n_id = typeof obj.n_id === 'undefined' ? Date.now() : obj.n_id;
        let node = {
            //node value
            value: obj.n_id,
            //node id
            id: 'node_' + obj.n_id,
            //node title
            title: obj.n_title,
            //node html elements
            elements: obj.n_elements,
            //node parent element
            parent: typeof obj.n_parent === 'undefined' ? { id: 0 } : obj.n_parent,
            //node child element ids
            childs: [],
            //childs status (child list opened or not)
            foldedStatus: this.config.foldedStatus,
            //check status for node
            checkStatus: obj.n_checkStatus,
            //this method will return child nodes
            getChilds: () => this.getChilds(node),
            //this method will remove node from dom
            deleteNode: () => this.deleteNode(node),
            //this method will toggle node
            toggleNode: () => this.toggleNode(node),
            //this method will show node location
            showFamily: () => this.showFamily(node)

        }

        //node is added to container
        this.nodeList.push(node);
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
        let icon = this.config.unFoldedIcon;
        let style = '';
        if (node.foldedStatus) {
            icon = this.config.foldedIcon;
            style = 'none';
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
        icon = icon.split(' ');
        for (let i = 0; i < icon.length; i++) {
            i_item.classList.add(icon[i]);
        }
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
        if (this.config.switchMode) {
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

            //if item created as checked
            ck_item.checked = node.checkStatus;

            //switch is added to li element
            li_item.appendChild(sw_item);
        }

        //set ul tag to li item
        li_item.appendChild(ul_item);

        //#endregion

        //if is main node
        if (node.parent.id === 0) {
            //put item to area
            this.area.appendChild(li_item);
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
        if (this.config.switchMode) {
            document.getElementById('ck_' + node.id).addEventListener('click', e => {
                let node = this.getNode(e.currentTarget.parentElement.parentElement.id.split('_')[1]);
                node.checkStatus = e.currentTarget.checked;
                if (this.config.familyMode) {
                    this.checkNodeFamily(node);
                } else {
                    this.checkNode(node);
                }
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
        if (this.data.length > 0) {
            //first reshape data
            let order = (list, p = { n_id: 0, Child: [] }, tree = []) => {
                let childrens = list.filter(y => y.n_parentid === p.n_id);
                if (childrens.length > 0) {
                    if (p.n_id === 0) {
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
                        this.createNode({
                            n_title: list[i].n_title,
                            n_id: list[i].n_id,
                            n_elements: [],
                            n_parent: this.getNode(list[i].n_parentid),
                            n_checkStatus: typeof list[i].n_checked === 'undefined' ? false : list[i].n_checked
                        });
                        if (list[i].Child) {
                            set(list[i].Child);
                        }
                    }
                }
                //start chain
            set(order(this.data));

        }
        //start drawcallback
        this.drawCallback();

    }
}