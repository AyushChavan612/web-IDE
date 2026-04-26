export interface IQueueServices {
    addJob(queueName : string , payload : any) : Promise<any>;
}