import { LightningElement, track, wire, api } from 'lwc';
import getCalendarRecs from '@salesforce/apex/timetrackerhelper.getCalendarRecs';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';
import dayrecsModal from 'c/dayrecsModal';
export default class Timetracker extends NavigationMixin(LightningElement) {
    @api recordId;
    @track recs;
    @track refreshTable;
    @track redirect_data;
    @track modaldata;
    @track presentdate = new Date();
    // @track day = this.presentdate.getDate();
    // @track month = this.presentdate.getMonth()+1;
    @track selyearvalue = this.presentdate.getFullYear();
    @track selyear;
    @track listMonth=["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    @wire(getCalendarRecs,{resourceId: '$recordId'})
    TimeRecs(result){
        if(result.data){
            this.refreshTable = result;
            this.recs = JSON.parse(JSON.stringify(result.data));
            console.log('data : '+JSON.stringify(this.recs));
            for(var prop in this.recs[0]['year_recs']){
                if(this.recs[0]['year_recs'][prop]['year']==this.selyearvalue){
                    this.selyear = this.recs[0]['year_recs'][prop]['month_recs'];
                }
               
            }
            
        }else{
            
            console.log("Error : "+result.error);
            
            
            
        }
    }

    

    

    fakefunction(){
        console.log("clicked");
    }

    handleRefresh(){
        refreshApex(this.refreshTable);
    }
    redirectlink(event){
        this.redirect_data = event.target.dataset.id;
        const objectApiName = event.target.dataset.objectapi;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.redirect_data ,
                objectApiName: objectApiName,
                actionName: 'view'
            }
        });
    }

    
    
    async handleShowModal(event){
        // console.log('modal data : '+JSON.stringify(result.data));
        var modday =event.target.dataset.day;
        var modmonth = event.target.dataset.month;
        var modyear = event.target.dataset.year;
        
        for(var prop in this.recs[0]['year_recs']){
            if(this.recs[0]['year_recs'][prop]['year']==modyear){
                for(var year in this.recs[0]['year_recs'][prop]['month_recs']){
                    if(this.recs[0]['year_recs'][prop]['month_recs'][year]['month']==modmonth){
                        for(var month in this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs']){
                            for(var week in this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs']){
                                if(this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs'][week]['year']==modyear &&
                                this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs'][week]['month']==modmonth &&
                                this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs'][week]['day']==modday){
                                    this.modaldata = this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs'][week]['dayList'];
                                    break;
                                }
                                
                            }
                            
                        }
                    }
                    // console.log(year+' : '+this.recs[0]['year_recs'][prop]['month_recs'][year]);
                }
            }
            // console.log(prop+' : '+this.recs[0]['year_recs'][prop]['year']);
        }
        
        var result = await dayrecsModal.open({
            size: 'small',
            description: 'Accessible description of modal\'s purpose',
            content: this.modaldata, 
            // day: this.day,
            // month: this.month,
            // year: this.year,
            labelheader: modday+'-'+this.listMonth[modmonth-1]+'-'+modyear,


        });
        console.log(result);
        if(result){
            this.navigateToRelatedRecordPage(result);
        }
        
    }

    navigateToRelatedRecordPage(result) {
        console.log(result['Id']);
        
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: result['Id'],
                objectApiName: result['api'],
                actionName: 'view'
            },
        });
        
        
    }

    handledropdown(event){
        const year_sel = event.detail.value;
        this.selyearvalue = year_sel;
        for(var prop in this.recs[0]['year_recs']){
            if(this.recs[0]['year_recs'][prop]['year']==year_sel){
                this.selyear = this.recs[0]['year_recs'][prop]['month_recs'];
            }
           
        }
        
    }

    
}