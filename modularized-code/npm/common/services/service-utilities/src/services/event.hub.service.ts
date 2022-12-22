import { EventHubProducerClient } from "@azure/event-hubs";
import * as stackTrace from "stack-trace";
import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";

export class EventHubService {
    private logger = Logger.getLogger("./services/event.hub.service");
    // private queueName: string;
    private trace: any;
    private traceFileName: any;
    private eventhubName: string;
    private ehClient: any;

    constructor(connectionString: any, eventhubName: string, ehClient?: any) {
        this.trace = stackTrace.get();
        this.traceFileName = this.trace[0].getFileName();
        this.eventhubName = eventhubName;
        this.setEhClient(connectionString, eventhubName, ehClient);
    }

    public setEhClient(connectionString: string, eventhubName: string, ehClient?: any) {
        if (!ehClient) {
            this.ehClient = new EventHubProducerClient(connectionString, eventhubName,
              {"retryOptions": {"maxRetries": 2, "retryDelayInMs": 100}});
        } else {
            this.ehClient = ehClient;
        }
    }

    public async send(message: any[]) {
        try {
            const batch = await this.ehClient.createBatch();
            batch.tryAdd( { body: message } );

            await this.ehClient.sendBatch(batch);
            // await this.producer.close(); // This might cause the 'The underlying AMQP connection is closed.' error
        } catch (error) {
            console.log("ERROR eventhubName  ", this.eventhubName);
            console.log("EH - Error ", error);
            this.logger.error(error);
            throw applicationInsightsService.errorModel(error, "send", this.traceFileName);
        }
    }
}

