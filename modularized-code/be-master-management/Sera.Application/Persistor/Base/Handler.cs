using System.Security.Claims;

namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public abstract class BaseHandler
    {
        private readonly IHttpContextAccessor httpContext;
        protected readonly ICosmosContext cosmosContext;
        protected readonly IFirebaseContext firebaseContext;
        protected readonly IDbContext dbContext;
        protected readonly IMessage message;
        protected readonly ICosmosContext eventContext;
        protected readonly IRESTOrganizationClient orgClient;
        protected readonly IMediator mediator;
        protected readonly IRESTRouteClient routeClient;
        protected readonly IRESTVehicleClient vehicleClient;
        protected readonly IRESTUserClient userClient;
        protected readonly IRESTDriverClient driverClient;
        protected readonly IRESTMasterClient masterClient;
        public BaseHandler(IDbContext dbContext)
        {
            this.dbContext = dbContext;
        }
        public BaseHandler(ICosmosContext cosmosContext)
        {
            this.cosmosContext = cosmosContext;
        }
        public BaseHandler(IFirebaseContext firebaseContext)
        {
            this.firebaseContext = firebaseContext;
        }
        public BaseHandler(IFirebaseContext firebaseContext, IMessage message)
        {
            this.firebaseContext = firebaseContext;
            this.message = message;
        }
        public BaseHandler(IDbContext dbContext, IMessage message)
        {
            this.dbContext = dbContext;
            this.message = message;
        }
        public BaseHandler(IDbContext dbContext, ICosmosContext eventContext,IMessage message)
        {
            this.dbContext = dbContext;
            this.eventContext = eventContext;
            this.message = message;
        }
        public BaseHandler(IDbContext dbContext, IMessage message, IRESTOrganizationClient orgClient)
        {
            this.dbContext = dbContext;
            this.message = message;
            this.orgClient = orgClient;
        }
        public BaseHandler(IDbContext dbContext, IMessage message, IRESTMasterClient masterClient,
                           ICosmosContext eventContext, IRESTUserClient userClient)
        {
            this.dbContext = dbContext;
            this.message = message;
            this.masterClient = masterClient;
            this.eventContext = eventContext;
            this.userClient = userClient;
        }       

        protected ClaimsPrincipal CurrentPrincipal
        {
            get
            {
                return httpContext.HttpContext?.User;
            }
        }

        protected string sourceURL;
        protected string SourceURL
        {
            get
            {
                if (string.IsNullOrWhiteSpace(sourceURL))
                {
                    var request = httpContext.HttpContext?.Request;
                    UriBuilder uriBuilder = new()
                    {
                        Scheme = request.Scheme,
                        Host = request.Host.Host,
                        Path = request.Path.ToString(),
                        Query = request.QueryString.ToString()
                    };

                    sourceURL = uriBuilder.Uri.ToString();
                }

                return sourceURL;
            }
        }

        private int userId;
        protected int UserId
        {
            get
            {
                _ = int.TryParse(httpContext.HttpContext?.Request?.Headers?[CommonConst.HEADER_USER_ID].FirstOrDefault(), out userId);
                return userId;
            }
        }

        private string transactionId;
        protected string TransactionId
        {
            get
            {
                if (string.IsNullOrWhiteSpace(transactionId))
                {
                    transactionId = httpContext.HttpContext?.Request?.Headers?[CommonConst.HEADER_TRANSACTION_ID].FirstOrDefault();
                }

                return transactionId;
            }
        }

        private string clientURL;
        protected string ClientURL
        {
            get
            {
                if (string.IsNullOrWhiteSpace(clientURL))
                {
                    clientURL = httpContext.HttpContext?.Request.GetTypedHeaders().Referer?.ToString();
                }

                return clientURL;
            }
        }
    }
}
