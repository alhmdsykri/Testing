using MediatR;
using Sera.Common;
using System.Diagnostics;
using System.Text;

namespace Sera.Application.Usecase
{
    public class LogErrorHandler : IRequestHandler<LogErrorRequest, IResultStatus>
    {
        public LogErrorHandler()
        { }

        public async Task<IResultStatus> Handle(LogErrorRequest request, CancellationToken cancellationToken)
        {
            IResultStatus result = new ResultStatus();
            Stopwatch watch = new();
            long duration = 0;
            watch.Start();

            if (request == null)
            {
                result.SetErrorStatus(Message.Empty("error log request"));
                return result;
            }

            StringBuilder builder = new();
            builder.AppendLine($"*EVENT*");
            builder.AppendLine($"LOG ERROR");
            builder.AppendLine($"An exception has occurred at {DateTime.Now:yyyy-MM-dd hh:mm:ss} UTC");

            //[REVISIT] MOVE EVENT HUB TO INFRASTRUCTURE
            //await using (var producer =
            //    new EventHubProducerClient(AppConst.FMS_EVENT_HUB_CONN_STRING, AppConst.EVENT_HUB_EVENT))
            //{
            //    using EventDataBatch batch = await producer.CreateBatchAsync(cancellationToken);
            //    EventRequest message = new()
            //    {
            //        Authorization = null,
            //        Body = request.Serialize(),
            //        Header = null,
            //        HTTPMethod = HTTPMethod.POST.ToString()
            //    };

            //    string body = message.Serialize();
            //    batch.TryAdd(new EventData(new BinaryData(body)));

            //    watch.Stop();
            //    duration += watch.ElapsedMilliseconds;
            //    builder.AppendLine($"Batch event data created: {watch.ElapsedMilliseconds} milisecond(s). Finish at: {DateTime.Now:yyyy-MM-dd hh:mm:ss} UTC");

            //    //SEND BATCH EVENT DATA TO EVENT HUB
            //    watch.Restart();
            //    await producer.SendAsync(batch, cancellationToken);

            //    watch.Stop();
            //    duration += watch.ElapsedMilliseconds;
            //    builder.AppendLine($"Batch event data sent: {watch.ElapsedMilliseconds} milisecond(s). Finish at: {DateTime.Now:yyyy-MM-dd hh:mm:ss} UTC");
            //    builder.AppendLine($"Process finished took {duration} milisecond(s) and finish at {DateTime.Now:yyyy-MM-dd hh:mm:ss} UTC");

            //    //SEND builder TO LOGSTASH
            //}

            result.SetSuccessStatus("Exception log event has been sent");
            return result;
        }
    }
}
