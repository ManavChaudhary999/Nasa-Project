const request = require("supertest"); // library used for testing http request
const app = require("../../app");
const {mongodbConnect, mongodbDisconnect} = require("../../services/mongodb");
const {loadPlanetsData} = require("../../models/planets.model");

describe("Test Launches Request", () => {
    beforeAll( async () => { // this will run beforeAll test
        await mongodbConnect();
        await loadPlanetsData();
    });

    afterAll(async ()=> {
        await mongodbDisconnect();
    });

    test("Test GET /launches", async ()=> {
        // const response = await request(app).get('/launches');
        // expect(response.statusCode).toBe(200);
    
        // Can also use this way
        const response = await request(app)
            .get('/v1/launches')
            .expect(200)
            .expect('Content-Type', /json/);
    });
    
    describe("Test POST /launches", ()=> {
        const mockData = {
            mission: "New Earth",
            destination: "Kepler-442 b",
            rocket: "Mac999",
            launchDate: "September 9, 2022"
        };
        const mockDataWithoutDate = {
            mission: "New Earth",
            destination: "Kepler-442 b",
            rocket: "Mac999"
        };
    
        it("should respond with 201 status", async () => {
            const response = await request(app)
                .post("/v1/launches")
                .send(mockData)
                .expect('Content-Type', /json/)
                .expect(201);
            
            // Testing Date Seprately
            const requestDate = new Date(mockData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(requestDate).toBe(responseDate);
    
            // Testing Without Date
            expect(response.body).toMatchObject(mockDataWithoutDate);
        });
    
        it("should respond with 400 status", async () => {
            const response = await request(app)
                .post("/v1/launches")
                .send(mockDataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400)
    
            expect(response.body).toStrictEqual({error: "Launch property is not assigned"});
        })
    
        it("should catch invalid dates", async ()=> {
            const mockDataWithInvalidDate = Object.assign({launchDate: "Manav"}, mockDataWithoutDate);
    
            const response = await request(app)
                .post("/v1/launches")
                .send(mockDataWithInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400)
    
            expect(response.body).toStrictEqual({error: "Launch Date is Not Assigned Properly"}); 
        });
    });
});