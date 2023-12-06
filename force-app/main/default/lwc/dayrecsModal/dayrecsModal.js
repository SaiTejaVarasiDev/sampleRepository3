import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { NavigationMixin } from 'lightning/navigation';
export default class DayrecsModal extends NavigationMixin(LightningModal) {
    // @api day;
    // @api month;
    // @api year;
    @api content;
    @api labelheader;
    handleOkay(){
        this.close();
    }
    redirectinglink(event){
        this.redirect_data = event.target.dataset.id;
        const objectApiName = event.target.dataset.objectapi;
        // console.log('id : '+this.redirect_data);
        // console.log('api : '+objectApiName);
        this.close({Id:this.redirect_data, api:objectApiName});
        
        // this[NavigationMixin.Navigate]({
        //     type: 'standard__recordPage',
        //     attributes: {
        //         recordId: this.redirect_data ,
        //         objectApiName: objectApiName,
        //         actionName: 'view'
        //     }
        // });
    }
}