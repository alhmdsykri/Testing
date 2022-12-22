using System.Security.Claims;

namespace Sera.Application.Usecase
{
    public abstract class BaseHandler
    {
        private readonly IHttpContextAccessor httpContext;
        protected readonly ICosmosContext eventContext;
        protected readonly IDbContext dbContext;
        protected readonly IMessage message;

        protected BaseHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
        {
            this.httpContext = httpContext;
            this.dbContext = dbContext;
        }

        protected BaseHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                              ICosmosContext eventContext, IMessage message)
        {
            this.httpContext = httpContext;
            this.eventContext = eventContext;
            this.dbContext = dbContext;
            this.message = message;
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

        private DRBACModel drbac;
        protected DRBACModel DRBAC
        {
            get
            {
                string? drbacHTTPCtxItem = httpContext.HttpContext?.Items?[CommonConst.DRBAC_PERMISSION_CONTEXT_ITEM_KEY].ToString();
                if (!string.IsNullOrWhiteSpace(drbacHTTPCtxItem) && drbac == null)
                {
                    drbac = drbacHTTPCtxItem.Deserialize<DRBACModel>();
                }

                return drbac;
            }
        }
    }
}
