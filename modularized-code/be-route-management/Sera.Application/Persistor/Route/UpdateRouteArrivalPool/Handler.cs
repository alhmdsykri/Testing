namespace Sera.Application.Persistor;

public class UpdateRouteArrivalPoolHandler : BaseHandler, IRequestHandler<UpdateRouteArrivalPoolBusRequest, IResultStatus>
{
	public UpdateRouteArrivalPoolHandler(
		IDbContext dbContext,
		IMessage message
	) : base(dbContext, message)
	{
	}

	public async Task<IResultStatus> Handle(
		UpdateRouteArrivalPoolBusRequest request,
		CancellationToken cancellationToken
	)
	{
		ResultStatus result = new();

		var data = request.data;

		var route = await dbContext.Route.FirstOrDefaultAsync(
			x =>
				x.routeId == data.routeId &&
				x.status == (int) EventStatus.COMPLETED,
			cancellationToken: cancellationToken
		);

		if (route == null)
		{
			return result.ReturnErrorStatus($"Route not found. TransactionId: {request.transactionId}");
		}

		route.arrivalPoolId = data.arrivalPoolId;
		route.arrivalPoolCode = data.arrivalPoolCode;
		route.arrivalPoolName = data.arrivalPoolName;
		route.completionStatus = (int) CompletionStatus.INPROGRESS;
		route.modifiedAt = DateTime.UtcNow;
		route.modifiedBy = request.username;
		route.status = (int)EventStatus.COMPLETED;
		route.transactionId = request.transactionId;

		if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
		{
			return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
		}

		#region SEND MESSAGE TO SERVICE BUS TO CREATE EVENT SOURCE STATUS
		ServiceBusRequest<string> serviceBusRequest = new()
		{
			data = request.data.Serialize(),
			entity = request.entity,
			feURL = request.feURL,
			method = request.method,
			source = request.source,
			status = (int)EventStatus.COMPLETED,
			username = request.username,
			transactionId = request.transactionId,
		};

		List<string> jsonRequest = new() { serviceBusRequest.Serialize() };
		await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME, CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME, jsonRequest);
		#endregion

		#region SEND MESSAGE TO SERVICE BUS FIREBASE
		await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME, CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME, jsonRequest);
		#endregion

		return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} completed successfully.");
	}
}