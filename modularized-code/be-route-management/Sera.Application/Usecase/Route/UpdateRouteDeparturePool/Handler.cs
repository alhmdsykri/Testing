using Sera.Entity.SQL;

namespace Sera.Application.Usecase;

public class UpdateRouteDeparturePoolHandler : BaseHandler, IRequestHandler<UpdateRouteDeparturePoolRequest, Response>
{
	private readonly IRESTClient _restClient;

	public UpdateRouteDeparturePoolHandler(
		IHttpContextAccessor httpContext,
		IDbContext dbContext,
		ICosmosContext eventContext,
		IMessage message,
		IRESTClient restClient
	) : base(httpContext, dbContext, eventContext, message)
	{
		_restClient = restClient;
	}

	public async Task<Response> Handle(
		UpdateRouteDeparturePoolRequest request,
		CancellationToken cancellationToken
	)
	{
		Response response = new();
		Route route = new();

		if (request.routeId > 0)
		{
			var findRoute = await dbContext.Route
				.FirstOrDefaultAsync(
					r =>
						r.routeId == request.routeId &&
						r.status == (int) EventStatus.COMPLETED,
					cancellationToken: cancellationToken
				);

			if (findRoute == null)
			{
				return response.Fail(TransactionId, Message.NotFound("Route Id"));
			}

			var eventHistory = await eventContext.GetAsync(TransactionId, AppConst.ROUTE);

			if (eventHistory?.status == 1)
			{
				return response.Fail(TransactionId, Message.ResourceLocking("Route"));
			}

			route = findRoute;
		}

		var location = await _restClient.GetLocationByIdAsync(TransactionId, UserId, request.departurePoolId);

		if (location.Status != ResponseStatus.SUCCESS)
		{
			return response.Fail(TransactionId, Message.Fail("Get Location Identifier"));
		}

		// If locationType isn't a Pool, return fail
		if(location.Data.LocationTypeId != (int) LocationType.POOL)
		{
			return response.Fail(TransactionId, Message.Fail("Location Type is not Pool"));
		}

		// If BU is not the same, return fail
		if (route.businessUnitId != location.Data.BusinessUnitId)
		{
			return response.Fail(TransactionId, Message.Fail("Business Unit Id is not match"));
		}

		//BUILD LOCATION COSMOS DB COLLECTION (TABLE) ENTITY
		EventHistory collection = new()
		{
			_id = AppFunc.TimestampComposite(),
			transactionId = TransactionId,
			method = HTTPMethod.PUT.ToString(),
			entity = "Route",
			source = SourceURL,
			payload = request.Serialize(),
			status = (int) EventStatus.INPROGRESS,
			userId = UserId,
			date = DateTime.UtcNow,
			datePartition = DateTime.UtcNow.ToString("yyyy-MM-dd")
		};

		//INSERT INTO COSMOS DB
		await eventContext.CreateAsync(collection);

		//SEND ENTITY TO SERVICE BUS
		ServiceBusRequest<UpdateRouteDeparturePoolRequest> serviceBusRequest = new()
		{
			data = request,
			entity = "Route",
			feURL = ClientURL,
			method = HTTPMethod.PUT.ToString(),
			source = SourceURL,
			status = (int) EventStatus.INPROGRESS,
			username = UserId,
			transactionId = TransactionId,
			filter = AppConst.SERVICE_BUS_MSSQL_ROUTE_FILTER_NAME,
			action = AppConst.FA_ACTION_PUT_ROUTE_UPDATE_DEPARTURE_POOL,
			startDate = DateTime.UtcNow,//[REVISIT]
			endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE)//[REVISIT]
		};

		List<string> jsonRequest = new() { serviceBusRequest.Serialize() };
		await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME, CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME, jsonRequest);

		return response.Success(TransactionId, Message.Accepted("Route Departure Pool"));
	}
}