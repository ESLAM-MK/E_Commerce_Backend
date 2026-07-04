const notificationTemplete = {
    "new_item":{
        title:"New item added",
        body: ( item_title)=>{
           return `New item has been added ${item_title}`
        }
    }
}
export default notificationTemplete