namespace Sera.Common.Interface.Message
{
    public interface IMessage
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="topicName">Service bus topic name</param>
        /// <param name="filter">Service bus filter name</param>
        /// <param name="messages">Service bus message body</param>
        /// <returns></returns>
        Task SendMessageAsync(string topicName, string filter, List<string> messages);
    }
}
