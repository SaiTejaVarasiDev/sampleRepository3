@isTest
public class timetrackertest {
    static testMethod void firstTest(){
        Account acc = new Account(Name = 'Test Account');
        insert acc;
        for(Integer i=0;i<5;i++){
        	Case case1 = new Case(AccountId = acc.Id,subject='test'+String.valueOf(i));
        	insert case1;  
        }
        List<timetrackerhelper.planRecstime> result = timetrackerhelper.getTimeRecs(acc.Id);
        Integer count =0;
        for(timetrackerhelper.planRecstime rec: result){
            for(timetrackerhelper.yearrecs year: rec.year_recs){
                for(timetrackerhelper.monthrecs month : year.month_recs){
                    for(timetrackerhelper.weekrecs week : month.week_recs){
                        for(timetrackerhelper.dayrecs day : week.day_recs){
                            if(day.data!=null){
                                for(timetrackerhelper.info data : day.data){
                                    count++;
                                }  
                            } 
                        }
                    }
                }
            }  
        }
        
        System.assertEquals(5,count);
    }
    
    static testMethod void secondTest(){
        Account acc = new Account(Name = 'Test 2 Account');
        insert acc;
        List<timetrackerhelper.planRecstime> result = timetrackerhelper.getTimeRecs(acc.Id);
        Integer count =0;
        for(timetrackerhelper.planRecstime rec: result){
            for(timetrackerhelper.yearrecs year: rec.year_recs){
                for(timetrackerhelper.monthrecs month : year.month_recs){
                    for(timetrackerhelper.weekrecs week : month.week_recs){
                        for(timetrackerhelper.dayrecs day : week.day_recs){
                            if(day.data!=null){
                                for(timetrackerhelper.info data : day.data){
                                    count++;
                                }  
                            } 
                        }
                    }
                }
            }  
        }
        
        System.assertEquals(0,count);
    }
    
    static testMethod void thirdTest(){
        Account acc = new Account(Name = 'Test 3 Account');
        insert acc;
        for(Integer i=0;i<5;i++){
            Business_review__c br = new Business_review__c(WhatId__c=acc.Id,Name = 'test'+String.valueOf(i),ActivityDate__c=date.newInstance(2023,1+i,1+i));
            insert br;
        }
        List<timetrackerhelper.planRecstime> result = timetrackerhelper.getTimeRecs(acc.Id);
        Integer count =0;
        for(timetrackerhelper.planRecstime rec: result){
            for(timetrackerhelper.yearrecs year: rec.year_recs){
                for(timetrackerhelper.monthrecs month : year.month_recs){
                    for(timetrackerhelper.weekrecs week : month.week_recs){
                        for(timetrackerhelper.dayrecs day : week.day_recs){
                            if(day.data!=null){
                                for(timetrackerhelper.info data : day.data){
                                    count++;
                                }  
                            } 
                        }
                    }
                }
            }  
        }
        
        System.assertEquals(5,count);
    }
}