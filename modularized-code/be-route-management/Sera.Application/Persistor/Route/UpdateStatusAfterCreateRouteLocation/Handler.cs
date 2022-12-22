namespace Sera.Application.Persistor;

public class UpdateStatusAfterCreateRouteLocationHandler : BaseHandler, IRequestHandler<UpdateStatusAfterCreateRouteLocationRequest, IResultStatus>
{
    public UpdateStatusAfterCreateRouteLocationHandler(IDbContext dbContext, IMessage message) : base(dbContext, message)
    {
    }

    public async Task<IResultStatus> Handle(UpdateStatusAfterCreateRouteLocationRequest request, CancellationToken cancellationToken)
    {
        IResultStatus result = new ResultStatus();
        var requestData = request.data;

        #region Update Status Route

        var route = await dbContext.Route.FirstOrDefaultAsync(x => x.routeId == requestData.routeId, cancellationToken: cancellationToken);

        if (route == null)
        {
            return result.ReturnErrorStatus(Message.NotFound("Route"));
        }

        route.status = (int)EventStatus.COMPLETED;
        route.transactionId = request.transactionId;
        route.modifiedAt = DateTime.UtcNow;
        route.modifiedBy = request.username;

        if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
        {
            return result.ReturnErrorStatus($"Error transactionId: {request.transactionId}");
        }

        #endregion

        #region SEND MESSAGE TO SERVICE BUS TO CREATE ROUTE EVENT SOURCE STATUS 2

        ServiceBusRequest<string> sbusRequest = new()
        {
            data = request.data.Serialize(),
            entity = AppConst.ROUTE,
            feURL = request.feURL,
            method = request.method,
            source = request.source,
            status = (int)EventStatus.COMPLETED,
            username = request.username,
            transactionId = request.transactionId,
            startDate = request.startDate,
            endDate = request.endDate,
            filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
            action = request.action
        };

        List<string> jsonRequest = new() { sbusRequest.Serialize() };
        await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                       CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                       jsonRequest);
        #endregion

        #region SEND MESSAGE TO SERVICE BUS FIREBASE STATUS 2

        sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
        jsonRequest = new() { sbusRequest.Serialize() };
        await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                       CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                       jsonRequest);
        #endregion

        return result.ReturnSuccessStatus($"TransactionId: {request.transactionId} has been completed");
    }
}