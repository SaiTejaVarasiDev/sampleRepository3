@isTest
public class timetrackertest {
    @TestSetup
    public static void dataSet(){
        // Create an account
        // Create an accountclr
        Account newAccount = new Account(Name = 'Pfizer');
        insert newAccount;
        
         Id currentUserId = UserInfo.getUserId();
        // Create 2 Tasks, 3 Case, 1 Event, 2 Account Goals => Net Records should be : 8
        Task task1 = new Task(Subject = 'Task 1',Status = 'Not Started', WhatId = newAccount.Id, ActivityDate = Date.today());
        Task task2 = new Task(Subject = 'Task 2',Status = 'Not Started', WhatId = newAccount.Id, ActivityDate = Date.today().addDays(1));
        Case case1 = new Case(Subject = 'Case 1',Status = 'New', AccountId = newAccount.Id);
        Case case2 = new Case(Subject = 'Case 2',Status = 'New', AccountId = newAccount.Id);
        Case case3 = new Case(Subject = 'Case 3',Status = 'New', AccountId = newAccount.Id);
        Event event = new Event(Subject = 'Event 1',WhatId = newAccount.Id,
                                StartDateTime = Datetime.now(),
                                EndDateTime = Datetime.now().addHours(1),
                                OwnerId = currentUserId,
                                ActivityDate = Date.today());
        // varasi_am__Account_Goal__c goal1 = new varasi_am__Account_Goal__c(Name = 'Goal 1',varasi_am__Account__c = newAccount.Id, varasi_am__Target_Date__c = Date.today().addDays(5));
        // varasi_am__Account_Goal__c goal2 = new varasi_am__Account_Goal__c(Name = 'Goal 2',varasi_am__Account__c =newAccount.Id, varasi_am__Target_Date__c = Date.today().addDays(10));

        //insert new List<SObject>{task1, task2, case1, case2, case3, event, goal1, goal2};
        insert task1;
        insert task2;
        insert case1;
        insert case2;
        insert case3;
        insert event;
        // insert goal1;
        // insert goal2;
    }

    static testMethod void getCalendarRecsTest(){
        Account acc ;
        try{
            acc = [Select Id,Name from Account where Name='Pfizer' WITH SECURITY_ENFORCED];
        }catch (System.QueryException exp) {
            AuraHandledException e =  new AuraHandledException('Error Enforcing security:'+exp.getMessage());
            throw e;
        }
        List<timetrackerhelper.CalendarView> result = timetrackerhelper.getCalendarRecs(acc.Id);
        Integer countOfRecords = 0;
        for(timetrackerhelper.yearrecs yr : result[0].year_recs){
            for(timetrackerhelper.monthrecs month : yr.month_recs ){
                for(timetrackerhelper.weekrecs week : month.week_recs){
                        for(timetrackerhelper.dayrecs day : week.day_recs ){
                            if(day.dayList.size()>0){
                                countOfRecords+=day.dayList.size();
                            }
                        }
                }
            }
        }
        System.assertEquals(countOfRecords,6,'Inaccurate timetrackerhelper Class !!');
    }
}