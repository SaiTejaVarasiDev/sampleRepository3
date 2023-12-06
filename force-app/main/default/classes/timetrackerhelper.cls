public with sharing class timetrackerhelper {
    // creating an empty calendar with year, month, day in yearmaplist.
    @AuraEnabled(cacheable=true)
    public static Map<Integer,Map<Integer, Map<Integer, dayrecs>>> intializeCalendar(Map<Integer,Map<Integer, Map<Integer, dayrecs>>> yearMapList,List<sObject> relatedObjectData,Calender_view__mdt cmdt){
        // Map<Integer,Map<Integer, Map<Integer, dayrecs>>> yearMapList = new Map<Integer,Map<Integer, Map<Integer, dayrecs>>>();
        //iterating the relatedObjectData obtained from custommetadata.
        for(sObject obj:relatedObjectData){
            Date Date_field_value = Date.valueOf(String.valueOf(obj.get(cmdt.Date_Field_Name__c)));//converting object type to date type.
            Integer trackYear = Date_field_value.year();
            Integer trackMnth = Date_field_value.month();
            //checking if year is present else add into the map.
            if(!yearMapList.containsKey(trackYear)){
                yearMapList.put(trackYear, new Map<Integer, Map<Integer, dayrecs>>());
            }
            //checking if month is present or else add.
            // addding all days in that month and assign their day and dates.
            if(!yearMapList.get(trackYear).containsKey(trackMnth)){
                yearMapList.get(trackYear).put(trackMnth,new Map<Integer,dayrecs>());
                Integer daysInMonth = Date.daysInMonth(trackYear,trackMnth);
                for(Integer i=1;i<=daysInMonth;i++){
                    Date currentDate = Date.newInstance(trackYear,trackMnth,i);
                    dayrecs dayrec = new dayrecs();
                    dayrec.day = i;
                    dayrec.dayofweek = Math.mod(Date.newInstance(1900, 1, 7).daysBetween(currentDate),7);
                    dayrec.month=trackMnth;
                    dayrec.year=trackYear;
                    dayrec.Recdate = currentDate;
                    dayrec.Display=true;
                    dayrec.dayList = new List<CalendarRecord>();
                    dayrec.pKey = String.valueOf(currentDate);
                    dayrec.sizeboolean = true;
                    yearMapList.get(trackYear).get(trackMnth).put(i,dayrec);
                }
            }
        }
        return yearMapList;
    }

    // entering calendar records into empty calendar map after intializeCalendar.
    @AuraEnabled(cacheable=true)
    public static Map<Integer,Map<Integer, Map<Integer, dayrecs>>> dataEntryIntoCalendar(Map<Integer,Map<Integer, Map<Integer, dayrecs>>> yearMapList,List<sObject> relatedObjectData,Calender_view__mdt cmdt){
        //iterating over the relatedObjectData collected from custom metadata.
        for(sObject obj:relatedObjectData){
            Date Date_field_value = Date.valueOf(String.valueOf(obj.get(cmdt.Date_Field_Name__c)));//converting object type to date type.
            Integer trackYear = Date_field_value.year();
            Integer trackMnth = Date_field_value.month();
            Integer trackDay = Date_field_value.day();
            dayrecs dayrec = yearMapList.get(trackYear).get(trackMnth).get(trackDay);//obtain the object of that respective date.
            //creating a calendar record.
            CalendarRecord record = new CalendarRecord();
            record.Id = obj.Id;
            record.Name = cmdt.Name__c;
            record.Fieldtodisplay = String.valueOf(obj.get(cmdt.Field_to_show_on_calender__c));
            record.pKey = record.Id+record.Fieldtodisplay;
            
            record.ObjectApiName = cmdt.Object_Name__c;
            
            record.Icon = cmdt.Icon_type__c+':'+cmdt.Icon__c;
            // index if true shows all default calendar records in daycell else shows in modal.
            if(dayrec.dayList.size()<2){
                record.indexboolean=true;
            }else{
                record.indexboolean=false;
            }
            // display is true if the day is in the current month.
            dayrec.Display = true;
            dayrec.dayList.add(record);
            //sizeboolean is used for displaying modal button.
            if(dayrec.dayList.size()>2){
                dayrec.sizeboolean = false;
            }
        }
        return yearMapList;
    }

    // creating a calendar map with year, month, days and respective day record data.
    @AuraEnabled(cacheable=true)
    public static Map<Integer,Map<Integer, Map<Integer, dayrecs>>> getyearMaplist(String resourceId){
        
        List<Calender_view__mdt> Custommetadata = [select Name__c,Object_Name__c,Date_Field_Name__c,Account_Lookup_Field__c,Field_to_show_on_calender__c,Icon__c,Icon_type__c from Calender_view__mdt];
        
        Map<Integer,Map<Integer, Map<Integer, dayrecs>>> yearMapList = new Map<Integer,Map<Integer, Map<Integer, dayrecs>>>();

        //collecting custommetadata records.
        for(Calender_view__mdt cmdt:Custommetadata){
            String selectString = 'Select '+'Id,'+cmdt.Date_Field_Name__c+','+cmdt.Field_to_show_on_calender__c+' ';
            String fromString = 'from '+cmdt.Object_Name__c+' ';
            String whereString = 'where '+cmdt.Account_Lookup_Field__c+' =  \'' +resourceId+'\' ';
            String orderString = 'order by '+cmdt.Date_Field_Name__c;
            String queryString = selectString + fromString + whereString + orderString;
            List<sObject> relatedObjectData = Database.query(queryString);
            
            
            yearMapList = intializeCalendar(yearMapList,relatedObjectData, cmdt);
            //empty calender Map formed.


            yearMapList = dataEntryIntoCalendar(yearMapList,relatedObjectData,cmdt);
            //data entered in calender map.
            
            
        }
        return yearMapList;
    }

    // method to pass calendar data into timetracker.js.
    @AuraEnabled(cacheable=true)
    public static List<CalendarView> getCalendarRecs(String resourceId){

        // month mapping
        Map<Integer,String> monthMap = new Map<Integer,String>{1=> 'January', 2 => 'February', 3 => 'March',
        4=> 'April', 5 => 'May', 6 => 'Jun',
        7=> 'July', 8 => 'August', 9 => 'September',
        10=> 'October', 11 => 'November', 12 => 'December'};

        // getting a calendar map which contains data. 
        Map<Integer,Map<Integer, Map<Integer, dayrecs>>> yearMapList = getyearMaplist(resourceId);
        
        //creating a basic structure of calendar map.
        List<yearrecs> yearrecsList = new List<yearrecs>();
        for(Integer year: yearMapList.keySet()){
            yearrecs y = new yearrecs();
            y.year = year;
            y.label=year;
            y.value=year;
            List<monthrecs> monthrecsList = new List<monthrecs>();
            List<Integer> monthListordered = new List<Integer>();
            for(Integer monthnumber : yearMapList.get(year).keySet()){
                monthListordered.add(monthnumber);
            }
            
            monthListordered.sort();
            for(Integer month : monthListordered){
                monthrecs m = new monthrecs();
                m.month = month;
                m.monthName = monthMap.get(month);
                m.pKey = String.valueOf(month)+String.valueOf(year);
                m.week_recs = new List<weekrecs>();
                
                Map<Integer, dayrecs> monthArray = yearMapList.get(year).get(month);
                

                Integer lastdayofweek;
                Integer prevmnthlastday;
                Integer firstdayofweek = Math.mod(Date.newInstance(1900, 1, 7).daysBetween(Date.newInstance(year,month,1)),7);
                if(month==1){
                    prevmnthlastday = Date.daysInMonth(year,12);
                }else{
                    prevmnthlastday = Date.daysInMonth(year,month-1);
                }
                List<dayrecs> opList = new List<dayrecs>();

                // to add previous date for a month with null data.
                for(Integer k=0;k<firstdayofweek;k++){
                    dayrecs dayrec = new dayrecs();
                    dayrec.day = prevmnthlastday-firstdayofweek+1+k;
                    
                    if(month==1){
                        dayrec.pKey = String.valueOf(Date.newInstance(year-1,12,dayrec.day));
                        
                    }else{
                        dayrec.pKey = String.valueOf(Date.newInstance(year,month-1,dayrec.day));
                        
                    }
                    
                    dayrec.Display = false;
                    opList.add(dayrec);
                    
                }

                //adding month days data from the year map list.
                for(Integer day : yearMapList.get(year).get(month).keySet()){
                    
                    opList.add(yearMapList.get(year).get(month).get(day));
                    lastdayofweek = yearMapList.get(year).get(month).get(day).dayofweek;
                    

                }
                // adding null daysdata at the month last days
                Integer nextmonthday=1;
                while(lastdayofweek<6){
                    dayrecs dayrec = new dayrecs();
                    lastdayofweek++;
                    dayrec.day=nextmonthday;
                    dayrec.Display = false;
                    if(month==12){
                        dayrec.Recdate = Date.newInstance(year+1,1,dayrec.day);
                    }else{
                        dayrec.Recdate = Date.newInstance(year,month+1,dayrec.day);
                    }
                    
                    dayrec.pKey=String.valueOf(dayrec.Recdate);
                    nextmonthday++;
                    opList.add(dayrec);
                }

                // diving data into weeks.
                Integer z=0;
                List<weekrecs> weekrecsList = new List<weekrecs>();
                for(Integer i=0;i<opList.size()/7;i++){
                    List<dayrecs> temp = new List<dayrecs>();
                    weekrecs week = new weekrecs();
                    for(Integer j=0;j<7;j++){
                        temp.add(opList[z]);
                        z++;
                    }
                    week.pKey = String.valueOf(year)+String.valueOf(month)+String.valueOf(i);
                    week.day_recs = temp;
                    weekrecsList.add(week);
                }
                
                m.week_recs = weekrecsList;
                monthrecsList.add(m);
            }
            
            y.month_recs = monthrecsList;
            yearrecsList.add(y);
        }

        // adding yearrecsList into CalendarView.
        List<CalendarView> result = new List<CalendarView>();
        Account current_acc = [Select Name from Account where Id =: resourceId];
        CalendarView acc = new CalendarView();
        acc.Id = resourceId;
        acc.Name = current_acc.Name;
        acc.year_recs = yearrecsList;
        result.add(acc);
        return result;
    }

    
    
    public class CalendarView{
        @AuraEnabled
        public String Id { get; set; }
        @AuraEnabled
        public String Name { get; set;}
        @AuraEnabled
        public List<yearrecs> year_recs { get; set;}
    }
    
    public class yearrecs{
        @AuraEnabled
        public Integer year { get; set; }
        @AuraEnabled
        public Integer label { get; set; }
        @AuraEnabled
        public Integer value { get; set; }
        @AuraEnabled
        public List<monthrecs> month_recs { get; set;}
    }
    
    public class monthrecs{
        @AuraEnabled
        public String pKey { get; set; }//MonthPlusYear
        @AuraEnabled
        public Integer month { get; set; }
        @AuraEnabled
        public String monthName { get; set; }
        @AuraEnabled
        public List<weekrecs> week_recs { get; set; } //weeekrecsList
    }
    
    public class weekrecs{
        @AuraEnabled
        public String pKey { get; set; }//month+year+weekcount
        @AuraEnabled
        public List<dayrecs> day_recs { get; set; } 
    }
    public class dayrecs{
        @AuraEnabled
        public String pKey { get; set; }//Full Date
        @AuraEnabled
        public Integer day { get; set; }
        @AuraEnabled
        public Integer dayofweek { get; set; }
        @AuraEnabled
        public Integer month { get; set; }
        @AuraEnabled
        public Integer year { get; set; }
        @AuraEnabled
        public Date Recdate { get; set;}
        @AuraEnabled
        public Boolean Display{ get; set; }// whether to display in calender.
        @AuraEnabled
        public List<CalendarRecord> dayList { get; set; }
        @AuraEnabled
        public Boolean sizeboolean { get; set; } // if size of data < 2 then true else false
        
        
    }

    public class CalendarRecord{
        @AuraEnabled
        public String Id { get; set; }
        @AuraEnabled
        public String pKey { get; set; }//ID+Name
        @AuraEnabled
        public String Name { get; set; }
        @AuraEnabled
        public String ObjectApiName { get; set; }
        @AuraEnabled
        public String Fieldtodisplay { get; set; }
        @AuraEnabled
        public String Icon { get; set; }
        @AuraEnabled
        public Boolean indexboolean { get; set; } // if index of record in data is less than 2 then true else false
    }
    
}