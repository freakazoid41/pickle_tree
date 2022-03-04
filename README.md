

# Pickle Tree

> Pickle tree is a tree component written as completely pure javascript. Just send json file to object and have fun :-D 

> Pickle tree does't need anything except you !

**Badges Falan**

- Simple javascript ability
- Simple css ability for some style editing for your project




## Initiation And Using Example 
> Demo Page : http://tree.picklecan.me/

> Initiate like this :

```javascript


const tree = new PickleTree({
        c_target: 'div_tree',
        rowCreateCallback: (node) => {
            //console.log(node)
        },
        switchCallback: (node) => {
            //console.log(node)
        },
        drawCallback: () => {
            //console.log('tree drawed ..');
        },
        dragCallback: (node) => {
            console.log(node);
        },
        dropCallback: (node) => {
            //retuns node with new parent and old parent in 'old_parent' key!!
            console.log(node);
        },
        nodeRemoveCallback:(node)=>{
            //returns removed node
            console.log(node);
        },
        c_config: {
            //start as folded or unfolded
            foldedStatus: false,
            //for logging
            logMode: false,
            //for switch element
            switchMode: true,
            //for automaticly select childs
            autoChild :true,
            //for automaticly select parents
            autoParent : true,
            //for drag / drop
            drag: true
        },
        c_data: [{
            n_id: 1,
            n_title: 'falan1',
            n_parentid: 0,
            n_checkStatus: true,
            n_elements : [{
                icon:'fa fa-edit',
                title:'Edit',
                //context button click event
                onClick : (node) => {
                    console.log('edit - '+node.id);
                }
            },{
                icon:'fa fa-trash',
                title:'Delete',
                onClick : (node) => {
                    console.log('delete - '+node.id);
                }
            }],
        }, {
            n_id: 2,
            n_title: 'falan2',
            n_parentid: 0
        }, {
            n_id: 3,
            n_title: 'falan3',
            n_parentid: 0
        }, {
            n_id: 4,
            n_title: 'falan1-1',
            n_parentid: 1
        }, {
            n_id: 5,
            n_title: 'falan1-2',
            n_parentid: 1
        }, {
            n_id: 10,
            n_title: 'falan1-2-1',
            n_parentid: 5
        }]
    });
```

---

> After that you can use some addional events for node like those:

```javascript

    //for getting node from it's id :
    let our_node = tree.getNode('5');

    //for deleting node
    our_node.deleteNode();

    //for toggling
    our_node.toggleNode();
    
    //for toggle on all parents and find location of node
    our_node.showFamily();

    //for getting it's childs
    our_node.getChilds();

    //for check / uncheck node
    our_node.toggleCheck(true / false);
    
    //for getting all checked (selected) nodes
    tree.getSelected();
    
    //for deselecting all checked (selected) nodes
    tree.resetSelected();
    
   

    //update node
    our_node.title = 'A new title for my node ';
    our_node.updateNode();
    //scroll to node
    our_node.scroll();
    
    //find childs of node from their text
    our_node.find('falan');

    // for creating new  node manualy
    let new_node = tree.createNode({
        n_value: 5,
        n_title: 'falan gibi 5',
        n_id: 5,
        n_elements: [],
        n_parent: tree.getNode(4),
        n_checkStatus: false
    });
    
    //destroy tree
    tree.destroy();

```

---

## Installation

- Just include js and css file to your project then you can use it

### Clone

- Clone this repo to your local machine using `https://github.com/freakazoid41/pickle_tree.git`

