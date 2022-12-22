using Azure.Messaging.ServiceBus;
using Sera.Application.Interface;
using Sera.Common;
using Sera.Infrastructure.KeyVault;

namespace Sera.Infrastructure.Message
{
    public class AzureServiceBus : IMessage
    {
        private static ServiceBusClient client;
        private static ServiceBusSender sender;

        public async Task SendMessageAsync(string topicName, List<string> messages)
        {
            var busConst = new AppConst(new AzureKeyVault());
            client = new(busConst.SERVICE_BUS_CONN_STRING);
            sender = client.CreateSender(topicName);

            using ServiceBusMessageBatch batch = await sender.CreateMessageBatchAsync();

            messages.ForEach(x =>
            {
                if (!batch.TryAddMessage(new ServiceBusMessage(x)))
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