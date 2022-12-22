import { ServiceBusClient } from "@azure/service-bus";
import * as stackTrace from "stack-trace";
import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";

// https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-nodejs-how-to-use-queues
export class ServiceBusService {
    private logger = Logger.getLogger("./services/provisioning.service");
    // private queueName: string;
    private trace: any;
    private traceFileName: any;
    private sbClient: any;
    private secClient: any;

    constructor(connectionString: any, sbClient?: any) {
        this.trace = stackTrace.get();
        this.traceFileName = this.trace[0].getFileName();
        this.setSbClient(connectionString, sbClient);
    }

    public setSbClient(connectionString: string, sbClient?: any) {
        if (!sbClient) {
            // create a Service Bus client using the connection string to the Service Bus namespace
            this.sbClient = new ServiceBusClient(connectionString);
        } else {
            this.sbClient = sbClient;
        }
    }

    public async send(messages: any[], topicName: string) {
        try {


            // createSender() can also be used to create a sender for a topic.
            const sender = this.sbClient.createSender(topicName);

            // Tries to send all messages in a single batch.
            // Will fail if the messages cannot fit in a batch.
            // await sender.sendMessages(messages);
            // create a batch object
            let batch = await sender.createMessageBatch();

            messages.forEach(async (element: any) => {
                console.log("Sending -> ", element);
                // for each message in the array
                // try to add the message to the batch
                if (!batch.tryAddMessage(element)) {
                    // if it fails to add the message to the current batch
                    // send the current batch as it is full
                    await sender.sendMessages(batch);

                    // then, create a new batch
                    batch = await sender.createMessageBatch();

                    // now, add the message failed to be added to the previous batch to this batch
                    if (!batch.tryAddMessage(element)) {
                        // if it still can't be added to the batch, the message is probably too big to fit in a batch
                        throw new Error("Message too big to fit in a batch");
                    }
                }
            });

            // Send the last created batch of messages to the queue
            const response: any = await sender.sendMessages(batch);
            console.log(`Successfully sent a batch of messages to the queue: ${topicName}`);

            // Close the sender
            await sender.close();
            return response;
        } catch (error) {
            console.log("Quename - Error ", topicName);
            console.log("SB - Error ", error);
            this.logger.error(error);
            throw applicationInsightsService.errorModel(error, "changeVehicleStatus", this.traceFileName);
        } finally {
            await this.sbClient.close();
        }
    }
}

