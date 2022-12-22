﻿namespace Sera.Application.Persistor
{
	public class UpdateCompletionStatusFromRouteLocationHandler : BaseHandler,
		IRequestHandler<UpdateCompletionStatusFromRouteLocationRequest, IResultStatus>
	{
		public UpdateCompletionStatusFromRouteLocationHandler(IDbContext dbContext, IMessage message)
			: base(dbContext, message)
		{ }

		public async Task<IResultStatus> Handle(UpdateCompletionStatusFromRouteLocationRequest request,
			CancellationToken cancellationToken)
		{
			ResultStatus result = new();

			var route = await dbContext.Route.FindAsync(request.data.routeId);

			if (route == null)
			{
				return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
			}

			#region BUILD MESSAGE TO SERVICE BUS TO CREATE EVENT SOURCE STATUS

			ServiceBusRequest<string> sbusRequest = new()
			{
				data = request.data.Serialize(),
				entity = request.entity,
				feURL = request.feURL,
				method = request.method,
				source = request.source,
				status = (int) EventStatus.INPROGRESS,
				username = request.username,
				transactionId = request.transactionId,
				filter = AppConst.SERVICE_BUS_MSSQL_ROUTE_FILTER_NAME,
				startDate = DateTime.UtcNow, //[REVISIT]
				endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
			};

			#endregion

			# region Update Route Status to InProgress

			route.completionStatus = (int) CompletionStatus.INPROGRESS;
			route.modifiedAt = DateTime.UtcNow;
			route.modifiedBy = request.username;
			route.transactionId = request.transactionId;

			if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
			{
				return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
			}

			#endregion

			#region Send Message for Route Service Bus

			sbusRequest.entity = AppConst.ROUTE;
			sbusRequest.status = (int) EventStatus.COMPLETED;
			List<string> jsonRequestRoute = new() { sbusRequest.Serialize() };

			// Route: Event
			await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME, CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME, jsonRequestRoute);
			#endregion

			#region Send Message for RouteLocation Service Bus

			sbusRequest.entity = AppConst.ROUTE_LOCATION;
			sbusRequest.status = (int) EventStatus.COMPLETED;
			List<string> jsonRequestRouteLocation = new() { sbusRequest.Serialize() };

			// RouteLocation: Event
			await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME, CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME, jsonRequestRouteLocation);

			// RouteLocation: Firebase
			await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME, CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME, jsonRequestRouteLocation);

			#endregion

			return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
		}
	}
}