// tests/crud_operations.js
const { app } = require("../app");
const get_chai = require("../util/get_chai");

const { testUserPassword, seed_db } = require("../util/seed_db");

describe("Job CRUD operations", function () {
  before(async function () {
  const { expect, request } = await get_chai();
  this.test_user = await seed_db();

  let req = request.execute(app).get("/session/logon").send();
  let res = await req;

  const textNoLineEnd = res.text.replaceAll("\n", "");
  const csrfMatch = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd);
  expect(csrfMatch).to.not.be.null; // fail early if no token found
  this.csrfToken = csrfMatch[1];

  let cookies = res.headers["set-cookie"] || [];
  this.csrfCookie = cookies.find((c) => c.startsWith("_csrf")) || "_csrf=FAKE";

  const dataToPost = new URLSearchParams({
      email: this.test_user.email,
      password: testUserPassword,
      _csrf: this.csrfToken,
    }).toString();

  req = request
    .execute(app)
    .post("/session/logon")
    .set("Cookie", this.csrfCookie)
    .set("content-type", "application/x-www-form-urlencoded")
    //.redirects(0)
    .send(dataToPost);

  res = await req;
  cookies = res.headers["set-cookie"] || [];
  this.sessionCookie = cookies.find((c) => c.startsWith("connect.sid")) || "connect.sid=FAKE";

  expect(this.csrfToken).to.not.be.undefined;
  expect(this.sessionCookie).to.not.be.undefined;
  expect(this.csrfCookie).to.not.be.undefined;
});

  it("should get job list with session cookie", async function () {
    const { expect, request } = await get_chai();

    const res = await request
      .execute(app)
      .get("/jobs")
      .set("Cookie", this.sessionCookie)
      .send();

    expect(res).to.have.status(200);

    // Count how many <tr> in the response (example)
    const count = (res.text.match(/<tr>/g) || []).length;
    expect(count).to.equal(20); // assuming 20 jobs seeded
  });

  // Add more tests for add/edit/delete jobs as needed
});
