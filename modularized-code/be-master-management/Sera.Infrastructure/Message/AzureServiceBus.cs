using Azure.Messaging.ServiceBus;
using Sera.Common;
using Sera.Common.Interface.Message;

namespace Sera.Infrastructure.Message
{
    public class AzureServiceBus : IMessage
    {
        private string connString;
        private static ServiceBusClient client;
        private static ServiceBusSender sender;

        public AzureServiceBus(string connString)
        {
            this.connString = connString;
        }

        public async Task SendMessageAsync(string topicName, string filter, List<string> messages)
        {
            client = new(connString);
            sender = client.CreateSender(topicName);

            using ServiceBusMessageBatch batch = await sender.CreateMessageBatchAsync();

            messages.ForEach(x =>
            {
                if (!batch.TryAddMessage(new ServiceBusMessage(x)
                {
                    ApplicationProperties = { { CommonConst.SERVICE_BUS_SQL_FILTER, filter } }
                }))
                {
                    throw new Exception($"The message is too large to fit in the batch.");
                }
            });

            try
            {
                await sender.SendMessagesAsync(batch);
            }
            finally
            {
                await sender.DisposeAsync();
                await client.DisposeAsync();
            }
        }
    }
}