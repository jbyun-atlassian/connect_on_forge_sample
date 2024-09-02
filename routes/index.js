
export default function routes(app, addon) {
  // Redirect root path to /atlassian-connect.json,
  // which will be served by atlassian-connect-express.
  app.get("/", (req, res) => {
    res.redirect("/atlassian-connect.json");
  });

  // This is an example route used by "generalPages" module (see atlassian-connect.json).
  // Verify that the incoming request is authenticated with Atlassian Connect.
  app.get("/hello-world", addon.authenticate(), (req, res) => {
    // Rendering a template is easy; the render method takes two params: the name of the component or template file, and its props.
    // Handlebars and jsx are both supported, but please note that jsx changes require `npm run watch-jsx` in order to be picked up by the server.
    res.render(
      "hello-world.hbs", // change this to 'hello-world.jsx' to use the Atlaskit & React version
      {
        title: "Atlassian Connect",
        //, issueId: req.query['issueId']
        //, browserOnly: true // you can set this to disable server-side rendering for react views
      }
    );
  });

  function get(httpClient, url) {
    return new Promise(function (resolve, reject) {
      httpClient.get(
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          url,
        },
        function (err, response, body) {
          if (err) {
            reject({
              statusCode: response.statusCode,
              message: err,
            });
          } else {
            resolve(body);
          }
        }
      );
    });
  }

  app.get("/license", addon.authenticate(), async (req, res) => {
    var httpClient = addon.httpClient(req);

    try {
      console.log("req.context.clientKey", req.context.clientKey);
      console.log("req.context.hostBaseUrl:", req.context.hostBaseUrl);
      console.log("req.context.userAccountId:", req.context.userAccountId);

      // License API
      const licenseApi = "/rest/atlassian-connect/1/addons/";
      const licApiResponse = await get(httpClient, `${licenseApi}${addon.key}`);
      console.log('license API Response, ', licApiResponse);
      const parsedLicApiRes = JSON.parse(licApiResponse);

      // Query Parameter
      const capabilitySet = req.query.capSet;
      const isAdvanced = capabilitySet === "capabilityAdvanced";

      // Lifecycle hook
      const clientSettings = await addon.settings.get(
        "clientInfo",
        req.context.clientKey
      );

      //results
      const capSetInLicenseAPI =
        parsedLicApiRes.license && parsedLicApiRes.license.capabilitySet
          ? parsedLicApiRes.license.capabilitySet
          : "N/A";
      const capSetInQP = req.query.capSet ? req.query.capSet : "N/A";
      const capSetInLifecycleHook = clientSettings.capabilitySet
        ? clientSettings.capabilitySet
        : "N/A";

      res.render("license-view.hbs", {
        capSetInLicenseAPI,
        capSetInQP,
        capSetInLifecycleHook,
        isAdvanced,
        errorExist: false,
      });
    } catch (ex) {
      console.log(ex);
      res.render("license-view.hbs", {
        errorExist: true,
        errorMessage: ex,
      });
    }
  });

  // Add additional route handlers here...
}
