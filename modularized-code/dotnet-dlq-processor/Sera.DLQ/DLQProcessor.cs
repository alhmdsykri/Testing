using Sera.Common.Interface.Message;

namespace Sera.DLQ.Processor
{
    public class DLQProcessor
    {
        private readonly IMessage message;
        public DLQProcessor(IMessage message)
        {
            this.message = message;
        }

        public async Task RequeueDLQ(string topicName, string filterName, string payload)
        {
            await message.SendMessageAsync(topicName, filterName, new List<string>() { payload });
        }
    }
}
