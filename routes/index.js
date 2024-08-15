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

  app.get("/license", addon.authenticate(), (req, res) => {
    var httpClient = addon.httpClient(req);
    console.log("url: " + "/rest/atlassian-connect/1/addons/" + addon.key);
    console.log("lic: " + req.query.lic);

    const capabilitySet = req.query.capSet;
    console.log("capabilitySet: " + capabilitySet);
    const isAdvanced = capabilitySet === "capabilityAdvanced";
    console.log("isAdvanced: " + isAdvanced);

    httpClient.get(
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        url: "/rest/atlassian-connect/1/addons/" + addon.key,
      },
      function (err, response, body) {
        if (err) {
          // console.log(response.statusCode + ": " + err);
          // res.send("Error: " + response.statusCode + ": " + err);
          res.render(
            'license-view.hbs', // change this to 'hello-world.jsx' to use the Atlaskit & React version
            {
              licenseData: "Error: " + response.statusCode + ": " + JSON.stringify(err)
              //, issueId: req.query['issueId']
              //, browserOnly: true // you can set this to disable server-side rendering for react views
            }
          );
        } else {
          // console.log(response.statusCode, body);
          // res.send(body);
          res.render(
            'license-view.hbs', // change this to 'hello-world.jsx' to use the Atlaskit & React version
            {
              licenseData: body,
              isAdvanced,
              //, issueId: req.query['issueId']
              //, browserOnly: true // you can set this to disable server-side rendering for react views
            }
          );
        }
      }
    );
  });

  // Add additional route handlers here...
}
