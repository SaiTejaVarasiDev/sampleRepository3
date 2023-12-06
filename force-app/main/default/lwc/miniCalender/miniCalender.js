import { LightningElement,track,wire,api } from 'lwc';
import getCalendarRecs from '@salesforce/apex/timetrackerhelper.getCalendarRecs';
import dayrecsModal from 'c/dayrecsModal';
import { NavigationMixin } from 'lightning/navigation';
export default class MiniCalender extends NavigationMixin(LightningElement) {
    @api recordId;
    @track selMonthindex=new Date().getMonth();
    @track selYear= new Date().getFullYear();
    @track selDay;
    @track listMonth=["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    @track selMonth=this.listMonth[this.selMonthindex];
    @track recs;
    // @track daysinmonth=this.getAllDatesofamonth(this.selYear,this.selMonthindex);
    @track daysinmonth;
    
    @track modaldata;
    @wire(getCalendarRecs,{resourceId: '$recordId'})
    TimeRecs(result){
        if(result.data){
            this.refreshTable = result;
            this.recs = JSON.parse(JSON.stringify(result.data));
            console.log('recs : '+JSON.stringify(this.recs[0]['year_recs']));
            this.daysinmonth=this.getAllDatesofamonth(this.selYear,this.selMonthindex)
        }else{
            console.log("Error : "+result.error);
        }
    }

    
    PrevMonth(){
        this.selMonthindex--;
        if(this.selMonthindex<0){this.selMonthindex+=12;}
        this.selMonthindex=this.selMonthindex%12;
        this.selMonth=this.listMonth[this.selMonthindex];
        // console.log('clicked');
        this.daysinmonth = this.getAllDatesofamonth(this.selYear,this.selMonthindex);
        
        
    }
    NextMonth(){
        this.selMonthindex++;
        this.selMonthindex=this.selMonthindex%12;
        this.selMonth=this.listMonth[this.selMonthindex];
        
        this.daysinmonth = this.getAllDatesofamonth(this.selYear,this.selMonthindex);
        
        
    }

    PrevYear(){
        this.selYear--;
        this.daysinmonth = this.getAllDatesofamonth(this.selYear,this.selMonthindex);
        
    }

    NextYear(){
        this.selYear++;
        this.daysinmonth = this.getAllDatesofamonth(this.selYear,this.selMonthindex);
    }

    iseventpresent(day_req){
        // console.log('called function : '+this.selYear+'-'+this.selMonthindex+' - '+day_req);
        for(var prop in this.recs[0]['year_recs']){
            if(this.recs[0]['year_recs'][prop]['year']==this.selYear){
                for(var year in this.recs[0]['year_recs'][prop]['month_recs']){
                    if(this.recs[0]['year_recs'][prop]['month_recs'][year]['month']==(this.selMonthindex+1)){
                        for(var month in this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs']){
                            for(var week in this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs']){
                                if(this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs'][week]['year']==this.selYear &&
                                this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs'][week]['month']==(this.selMonthindex+1)&&
                                this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs'][week]['day']==day_req){
                                    // console.log(week+' : '+this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs'][week]['day']+' : '+this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs'][week]['month']+' : '+this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs'][week]['year']);
                                    var temp = this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs'][week]['dayList'];
                                    if(temp.length>0){
                                        return true;
                                    }else{
                                        return false;
                                    }
                                    
                                }
                                
                            }
                            
                        }
                    }
                    // console.log(year+' : '+JSON.stringify(this.recs[0]['year_recs'][prop]['month_recs'][year]['monthName']));
                }
            }
            // console.log(prop+' : '+this.recs[0]['year_recs'][prop]['year']);
        }
        return false;
    }

    getAllDatesofamonth(year, month){
        
        let startdate = new Date(year, month, 1);
        let enddate = new Date(year, month+1, 1);
        
        
        
        let dates=[];
        while (startdate < enddate) {
            
            var weekindex = new Date(startdate).getDay();
            var dayindex = new Date(startdate).getDate();
            const pkey =  this.selYear.toString()+'-'+this.selMonth.toString()+'-'+dayindex.toString()+'-'+weekindex.toString();
            // console.log('calling function : '+this.selYear+'-'+this.selMonthindex+' - '+dayindex);
            var val = this.iseventpresent(dayindex);
            if(dayindex>9){
                var widthcol = true;
            }else{
                var widthcol = false;
            }
            // console.log('day : '+dayindex+' val: '+val);
            let dayData={day:weekindex, date:dayindex, pKey:pkey, state:true, record:val, widthcol:widthcol};
            dates.push(dayData);
            startdate.setDate(startdate.getDate() + 1);
        }
        let final_dates = [];
        var i=0;
        var j = dates.length;
        let count =0
        let week_dates = [];
        while(i<j){
            if(i==0){
                let k =0;
                while(k<dates[i]['day']){
                    const pkey =  this.selYear.toString()+'-'+this.selMonth.toString()+'-'+i.toString()+'-'+k.toString();
                    week_dates.push({day:null, date: null, pKey: pkey, state:false});
                    k++;
                    count++;
                }
            }
            week_dates.push(dates[i]);
            count++;
            i++;
            if(count==7){
                const m = week_dates.slice();
                const pkey = this.selYear.toString()+'-'+this.selMonth.toString()+'-'+i.toString();
                let temp = {pKey:pkey, data:m};
                
                final_dates.push(temp);
                // console.log('week dates : '+JSON.stringify(temp));
                week_dates.splice(0,week_dates.length);
                count=0;
            }
            
            
            
            
        }
        if(week_dates.length>0){
            let initdate = 1;
            let month = this.selMonth+1;
            while(week_dates.length<7){
                const pkey =  this.selYear.toString()+'-'+month.toString()+'-'+initdate.toString();
                week_dates.push({day:null, date: null, pKey: pkey, state:false});
            }
            const m = week_dates.slice();
            const pkey = this.selYear.toString()+'-'+this.selMonth.toString()+'-'+i.toString();
            let temp = {pKey:pkey, data:m};
            final_dates.push(temp);
            // console.log('week dates : '+JSON.stringify(week_dates));
        }
        // console.log('length : '+final_dates.length);
        // console.log('final dates : '+JSON.stringify(final_dates));
        return final_dates;
    }

    

    
    async modalbutton(event){
        const Day = event.target.dataset.date;
        // console.log('date : '+Day);
        // console.log('month : '+this.selMonth);
        // console.log('year : '+this.selYear);
        
        for(var prop in this.recs[0]['year_recs']){
            if(this.recs[0]['year_recs'][prop]['year']==this.selYear){
                for(var year in this.recs[0]['year_recs'][prop]['month_recs']){
                    if(this.recs[0]['year_recs'][prop]['month_recs'][year]['month']==(this.selMonthindex+1)){
                        for(var month in this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs']){
                            for(var week in this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs']){
                                if(this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs'][week]['year']==this.selYear &&
                                this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs'][week]['month']==(this.selMonthindex+1)&&
                                this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs'][week]['day']==Day){
                                    // console.log(week+' : '+this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs'][week]['day']+' : '+this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs'][week]['month']+' : '+this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs'][week]['year']);
                                    this.modaldata = this.recs[0]['year_recs'][prop]['month_recs'][year]['week_recs'][month]['day_recs'][week]['dayList'];
                                    break;
                                }
                                
                            }
                            
                        }
                    }
                    // console.log(year+' : '+JSON.stringify(this.recs[0]['year_recs'][prop]['month_recs'][year]['monthName']));
                }
            }
            // console.log(prop+' : '+this.recs[0]['year_recs'][prop]['year']);
        }
        console.log('modal data : '+this.modaldata);
        var result = await dayrecsModal.open({
            size: 'small',
            description: 'Accessible description of modal\'s purpose',
            content: this.modaldata, 
            
            labelheader: Day+'-'+this.listMonth[this.selMonthindex]+'-'+this.selYear,


        });
        if(result){
            this.navigateToRelatedRecordPage(result);
        }
        
    }

    navigateToRelatedRecordPage(result) {
        // console.log(result['Id']);
        
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: result['Id'],
                objectApiName: result['api'],
                actionName: 'view'
            },
        });
        
        
    }



}