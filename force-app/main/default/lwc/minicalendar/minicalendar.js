import { LightningElement, track, wire, api } from 'lwc';
import getTimeRecs from '@salesforce/apex/timetrackerhelper.getTimeRecs';
import { refreshApex } from '@salesforce/apex';
export default class Timetracker extends LightningElement {
    @api recordId;
    @track recs;
    @track refreshTable;
    @wire(getTimeRecs,{resourceId: '$recordId'})
    TimeRecs(result){
        if(result.data){
            this.refreshTable = result;
            this.recs = JSON.parse(JSON.stringify(result.data));
            // console.log(JSON.stringify(this.recs));
            // try{
            //     const parsedobj = JSON.parse(this.recs);
            //     if(parsedobj && typeof parsedobj === 'object'){
            //         const map = new Map(Object.entries(parsedobj));
            //         console.log(map);
            //     }
            // }catch(error){
            //     console.error('error passing json :',error.message);
            // }
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

    @track recs = [];

    connectedCallback() {
        // Fetch data when the component is connected
        this.loadData();
    }

    async loadData() {
        try {
            // Fetch data from the Apex method
            this.recs = await getTimeRecs({ resourceId: 'your_resource_id' }); // Replace with your resource ID
            
            // Implement logic to initialize displayedMonth and displayedYear in recs based on data
            // Example: this.recs[0].year_recs[0].month_recs[0].displayedMonth = 1; // January
            //          this.recs[0].year_recs[0].displayedYear = 2023;
        } catch (error) {
            console.error(error);
        }
    }

    handleMonthNavigation(event) {
        const monthKey = event.target.dataset.monthkey;
        const direction = event.target.dataset.direction;
        
        // Find the correct month record and update its displayedMonth property
        // Update the 'recs' array accordingly
        
        // Example: this.recs[0].year_recs[0].month_recs[0].displayedMonth = 2; // February
        
        // You might need to call loadData() again after updating the 'recs' array
    }

    handleYearNavigation(event) {
        const yearKey = event.target.dataset.yearkey;
        const direction = event.target.dataset.direction;

        // Find the correct year record and update its displayedYear property
        // Update the 'recs' array accordingly
        
        // Example: this.recs[0].year_recs[0].displayedYear = 2024;
        
        // You might need to call loadData() again after updating the 'recs' array
    }


    @track recs = [];

    connectedCallback() {
        // Fetch data when the component is connected
        this.loadData();
    }

    async loadData() {
        try {
            // Fetch data from the Apex method
            this.recs = await getTimeRecs({ resourceId: this.recordId }); // Replace with your resource ID
            
            // Implement logic to initialize displayedMonth and displayedYear in recs based on data
            // Example: this.recs[0].year_recs[0].month_recs[0].displayedMonth = 1; // January
            //          this.recs[0].year_recs[0].displayedYear = 2023;
        } catch (error) {
            console.error(error);
        }
    }

    handleMonthNavigation(event) {
        const monthKey = event.target.dataset.monthkey;
        const direction = event.target.dataset.direction;

        // Find the correct month record and update its displayedMonth property
        for (const yearRec of this.recs[0].year_recs) {
            for (const monthRec of yearRec.month_recs) {
                if (monthRec.pKey === monthKey) {
                    if (direction === 'prev') {
                        monthRec.displayedMonth--;
                        if (monthRec.displayedMonth < 1) {
                            monthRec.displayedMonth = 12;
                            yearRec.displayedYear--;
                        }
                    } else if (direction === 'next') {
                        monthRec.displayedMonth++;
                        if (monthRec.displayedMonth > 12) {
                            monthRec.displayedMonth = 1;
                            yearRec.displayedYear++;
                        }
                    }
                    break;
                }
            }
        }

        // Call loadData() again after updating the 'recs' array
        this.loadData();
    }

    handleYearNavigation(event) {
        const yearKey = event.target.dataset.yearkey;
        const direction = event.target.dataset.direction;

        // Find the correct year record and update its displayedYear property
        for (const yearRec of this.recs[0].year_recs) {
            if (yearRec.year.toString() === yearKey) {
                if (direction === 'prev') {
                    yearRec.displayedYear--;
                } else if (direction === 'next') {
                    yearRec.displayedYear++;
                }
                break;
            }
        }

        // Call loadData() again after updating the 'recs' array
        this.loadData();
    }
    
}