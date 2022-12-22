using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;

namespace Sera.SecurityMiddleware
{
    public class NwebSec
    {
        private readonly RequestDelegate _next;
        public NwebSec(RequestDelegate next)
        {
            _next = next;
        }
        public Task Invoke(HttpContext context)
        {
            // TODO Change the value depending of your needs
            context.Response.Headers.Add("x-xss-protection", new StringValues("1; mode=block"));
            context.Response.Headers.Add("x-content-type-options", new StringValues("nosniff"));
            context.Response.Headers.Add("Content-Security-Policy", new StringValues(
                "base-uri 'none';" +
                "block-all-mixed-content;" +
                "child-src 'none';" +
                "connect-src 'none';" +
                "default-src 'none';" +
                "font-src 'none';" +
                "form-action 'none';" +
                "frame-ancestors 'none';" +
                "frame-src 'none';" +
                "img-src 'none';" +
                "manifest-src 'none';" +
                "media-src 'none';" +
                "object-src 'none';" +
                "sandbox;" +
                "script-src 'none';" +
                "script-src-attr 'none';" +
                "script-src-elem 'none';" +
                "style-src 'none';" +
                "style-src-attr 'none';" +
                "style-src-elem 'none';" +
                "upgrade-insecure-requests;" +
                "worker-src 'none';" +
                "default-src 'self';" +
                "img-src 'self'" +
                "font-src 'self';" +
                "style-src 'self';" +
                "script-src 'self'" +
                "frame-src 'self';" +
                "connect-src 'self';"
                ));
            context.Response.Headers.Add("x-frame-options", new StringValues("DENY"));
            context.Response.Headers.Add("referrer-policy", new StringValues("strict-origin-when-cross-origin"));
            context.Response.Headers.Add("X-Permitted-Cross-Domain-Policies", new StringValues("none"));
            context.Response.Headers.Add("Feature-Policy", new StringValues(
                "accelerometer 'none';" +
                "ambient-light-sensor 'none';" +
                "autoplay 'none';" +
                "battery 'none';" +
                "camera 'none';" +
                "display-capture 'none';" +
                "document-domain 'none';" +
                "encrypted-media 'none';" +
                "execution-while-not-rendered 'none';" +
                "execution-while-out-of-viewport 'none';" +
                "gyroscope 'none';" +
                "magnetometer 'none';" +
                "microphone 'none';" +
                "midi 'none';" +
                "navigation-override 'none';" +
                "payment 'none';" +
                "picture-in-picture 'none';" +
                "publickey-credentials-get 'none';" +
                "sync-xhr 'none';" +
                "usb 'none';" +
                "wake-lock 'none';" +
                "xr-spatial-tracking 'none';"
                ));
            return _next(context);
        }
    }    

    public static class NwebSecSecurityMiddleware
    {
        public static IApplicationBuilder UseNwebSecSecurityMiddleware(
            this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<NwebSec>();
        }
    }

    
}
