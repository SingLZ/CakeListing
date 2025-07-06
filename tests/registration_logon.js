const { app } = require("../app");
const get_chai = require("../util/get_chai");
const { seed_db, testUserPassword } = require("../util/seed_db");
const User = require("../models/User");
const crypto = require("crypto"); 

describe("tests for registration and logon", function () {
  let csrfToken;
  let csrfCookie;
  let freshUser;
  const password = "SomeStrongPassword123!";

  it("should get the registration page", async () => {
    const { expect, request } = await get_chai();
    const res = await request.execute(app).get("/session/register").send();
    expect(res).to.have.status(200);
    expect(res.text).to.include("Enter your name");

    const textNoLineEnd = res.text.replaceAll("\n", "");
    const csrfTokenMatch = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd);
    expect(csrfTokenMatch).to.not.be.null;

    csrfToken = csrfTokenMatch[1];

    const cookies = res.headers["set-cookie"];
    console.log("Cookies received:", cookies);
    csrfCookie = cookies.map((c) => c.split(";")[0]).join("; ");
    expect(csrfCookie).to.not.be.undefined;

    console.log("CSRF Cookie:", csrfCookie);
console.log("CSRF Token:", csrfToken);

    const randomStr = crypto.randomBytes(5).toString("hex");
    freshUser = {
      name: `TestUser${randomStr}`,
      email: `test${randomStr}@example.com`,
    };
  });

  it("should register the user", async () => {
    const { expect, request } = await get_chai();

    const dataToPost = {
      name: freshUser.name,
      email: freshUser.email,
      password,
      password1: password,
      _csrf: csrfToken,
    };

    const res = await request
      .execute(app)
      .post("/session/register")
      .set("Cookie", csrfCookie)
      .type("form")
      .send(dataToPost);

    expect(res).to.have.status(200);
    expect(res.text).to.include("Cakes List");

    const newUser = await User.findOne({ email: freshUser.email });
    expect(newUser).to.not.be.null;
  });
});
