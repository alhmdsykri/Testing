namespace Sera.Application.Function
{
    public interface IRouteRepository
    {
        Task<IResultStatus> SaveChangesAsync(FleetXRouteRequest request,
                                             CancellationToken cancellationToken);
    }

    public class CreateRouteRepository : IRouteRepository
    {
        private readonly IDbContext dbContext;
        public CreateRouteRepository(IDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<IResultStatus> SaveChangesAsync(FleetXRouteRequest request,
                                                          CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            SQL.Route entity = new();
            entity.routeCode = request.routeId;
            entity.routeName = request.routeName;
            entity.businessUnitId = request.businessUnitId;
            entity.returnRouteId = null;
            entity.returnRouteCode = null;
            entity.returnRouteName = String.Empty;
            entity.lastUpdate = request.lastUpdate; // EnqueuedTimeUtc service bus
            entity.routeJSON = request.routeJSON;
            entity.routeKML = request.routeKML;
            entity.customerId = null;
            entity.customerCode = string.Empty;
            entity.customerName = String.Empty;
            entity.contractNumber = String.Empty;
            entity.status = (int)EventStatus.INPROGRESS;
            entity.completionStatus = (int)CompletionStatus.INCOMPLETED;
            entity.createdAt = DateTime.UtcNow;
            entity.createdBy = request.userId;
            entity.modifiedAt = DateTime.UtcNow;
            entity.modifiedBy = request.userId;
            entity.version = AppConst.DATA_VERSION;
            entity.transactionId = request.transactionId;

            await dbContext.Route.AddAsync(entity, cancellationToken);

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            return result.ReturnSuccessStatus(Message.InsertSuccess("Route"));
        }
    }

    public class UpdateRouteRepository : IRouteRepository
    {
        private readonly IDbContext dbContext;
        public UpdateRouteRepository(IDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<IResultStatus> SaveChangesAsync(FleetXRouteRequest request,
                                                    CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            SQL.Route entity = await dbContext.Route.FindAsync(request.routeId);

            if (entity == null || entity.routeId <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId} Message : ", Message.NotExist("Route"));
            }

            entity.routeName = request.routeName;
            entity.lastUpdate = request.lastUpdate; // EnqueuedTimeUtc service bus
            entity.routeJSON = request.routeJSON;
            entity.routeKML = request.routeKML;
            entity.status = (int)EventStatus.COMPLETED;
            entity.completionStatus = (int)CompletionStatus.INCOMPLETED;
            entity.modifiedAt = DateTime.UtcNow;
            entity.modifiedBy = request.userId;
            entity.version = AppConst.DATA_VERSION;

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            return result.ReturnSuccessStatus(Message.UpdateSuccess("Route"));
        }
    }
}