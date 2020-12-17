import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import { ActivatedRoute, convertToParamMap, Params } from '@angular/router';
import { StudentExamsComponent } from 'app/exam/manage/student-exams/student-exams.component';
import { ArtemisDataTableModule } from 'app/shared/data-table/data-table.module';
import { ExamManagementService } from 'app/exam/manage/exam-management.service';
import { MockComponent, MockDirective, MockPipe, MockProvider } from 'ng-mocks';
import { StudentExamService } from 'app/exam/manage/student-exams/student-exam.service';
import { CourseManagementService } from 'app/course/manage/course-management.service';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { JhiAlertService, JhiTranslateDirective } from 'ng-jhipster';
import { TranslateModule } from '@ngx-translate/core';
import { StudentExamStatusComponent } from 'app/exam/manage/student-exams/student-exam-status.component';
import { AlertComponent } from 'app/shared/alert/alert.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FontAwesomeTestingModule } from '@fortawesome/angular-fontawesome/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ArtemisDurationFromSecondsPipe } from 'app/shared/pipes/artemis-duration-from-seconds.pipe';
import { ArtemisDatePipe } from 'app/shared/pipes/artemis-date.pipe';
import { MockLocalStorageService } from '../../../../helpers/mocks/service/mock-local-storage.service';
import { LocalStorageService } from 'ngx-webstorage';
import { Course } from 'app/entities/course.model';
import { of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { StudentExam } from 'app/entities/student-exam.model';
import * as sinon from 'sinon';
import { Exam } from 'app/entities/exam.model';
import { User } from 'app/core/user/user.model';
import * as moment from 'moment';
import { By } from '@angular/platform-browser';

chai.use(sinonChai);
const expect = chai.expect;

describe('StudentExamsComponent', () => {
    let studentExamsComponentFixture: ComponentFixture<StudentExamsComponent>;
    let studentExamsComponent: StudentExamsComponent;
    let course: Course;
    let student: User;
    let studentExamOne: StudentExam;
    let exam: Exam;

    beforeEach(() => {
        course = new Course();
        course.id = 1;

        student = new User();
        student.id = 1;

        exam = new Exam();
        exam.course = course;
        exam.id = 1;
        exam.registeredUsers = [student];
        exam.endDate = moment();
        exam.startDate = exam.endDate.subtract(60, 'seconds');

        studentExamOne = new StudentExam();
        studentExamOne.exam = exam;
        studentExamOne.id = 1;
        studentExamOne.workingTime = 70;
        studentExamOne.user = student;

        return TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([]), ArtemisDataTableModule, NgbModalModule, NgxDatatableModule, FontAwesomeTestingModule, TranslateModule.forRoot()],
            declarations: [
                StudentExamsComponent,
                MockComponent(StudentExamStatusComponent),
                MockComponent(AlertComponent),
                MockPipe(ArtemisDurationFromSecondsPipe),
                MockPipe(ArtemisDatePipe),
            ],
            providers: [
                MockProvider(ExamManagementService, {
                    find: () => {
                        return of(
                            new HttpResponse({
                                body: exam,
                                status: 200,
                            }),
                        );
                    },
                    assessUnsubmittedExamModelingAndTextParticipations: () => {
                        return of(
                            new HttpResponse({
                                body: 1,
                                status: 200,
                            }),
                        );
                    },
                }),
                MockProvider(StudentExamService, {
                    findAllForExam: () => {
                        return of(
                            new HttpResponse({
                                body: [studentExamOne],
                                status: 200,
                            }),
                        );
                    },
                }),
                MockProvider(CourseManagementService, {
                    find: () => {
                        return of(
                            new HttpResponse({
                                body: course,
                                status: 200,
                            }),
                        );
                    },
                }),
                MockProvider(JhiAlertService),
                MockDirective(JhiTranslateDirective),
                {
                    provide: LocalStorageService,
                    useClass: MockLocalStorageService,
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: {
                            subscribe: (fn: (value: Params) => void) =>
                                fn({
                                    courseId: 1,
                                }),
                        },
                        snapshot: {
                            paramMap: convertToParamMap({
                                courseId: '1',
                                examId: '1',
                            }),
                        },
                    },
                },
            ],
        })
            .compileComponents()
            .then(() => {
                studentExamsComponentFixture = TestBed.createComponent(StudentExamsComponent);
                studentExamsComponent = studentExamsComponentFixture.componentInstance;
            });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should initialize', () => {
        const courseManagementService = TestBed.inject(CourseManagementService);
        const examManagementService = TestBed.inject(ExamManagementService);
        const studentExamService = TestBed.inject(StudentExamService);

        const findCourseSpy = sinon.spy(courseManagementService, 'find');
        const findExamSpy = sinon.spy(examManagementService, 'find');
        const findAllStudentExamsSpy = sinon.spy(studentExamService, 'findAllForExam');
        studentExamsComponentFixture.detectChanges();

        expect(studentExamsComponentFixture).to.be.ok;
        expect(findCourseSpy).to.have.been.calledOnce;
        expect(findExamSpy).to.have.been.calledOnce;
        expect(findAllStudentExamsSpy).to.have.been.calledOnce;
        expect(studentExamsComponent.course).to.deep.equal(course);
        expect(studentExamsComponent.studentExams).to.deep.equal([studentExamOne]);
        expect(studentExamsComponent.exam).to.deep.equal(exam);
        expect(studentExamsComponent.hasStudentsWithoutExam).to.equal(false);
        expect(studentExamsComponent.longestWorkingTime).to.equal(studentExamOne.workingTime);
        expect(studentExamsComponent.isExamOver).to.equal(false);
        expect(studentExamsComponent.isLoading).to.equal(false);
    });

    it('should not show assess unsubmitted student exam modeling and text participations', () => {
        // user is not an instructor
        studentExamsComponentFixture.detectChanges();
        const assessButton = studentExamsComponentFixture.debugElement.query(By.css('#assessUnsubmittedExamModelingAndTextParticipationsButton'));
        expect(assessButton).to.not.exist;
    });

    it('should disable show assess unsubmitted student exam modeling and text participations', () => {
        course.isAtLeastInstructor = true;

        // exam is not over
        studentExamsComponentFixture.detectChanges();
        const assessButton = studentExamsComponentFixture.debugElement.query(By.css('#assessUnsubmittedExamModelingAndTextParticipationsButton'));
        expect(assessButton).to.exist;
        expect(assessButton.nativeElement.disabled).to.equal(true);
    });

    it('should automatically assess modeling and text exercises of unsubmitted student exams', () => {
        const examManagementService = TestBed.inject(ExamManagementService);

        studentExamOne.workingTime = 10;
        exam.startDate = moment().subtract(20, 'seconds');
        exam.endDate = moment().subtract(10, 'seconds');
        exam.gracePeriod = 0;
        course.isAtLeastInstructor = true;

        studentExamsComponentFixture.detectChanges();
        expect(studentExamsComponent.isLoading).to.equal(false);
        expect(studentExamsComponent.isExamOver).to.equal(true);
        expect(course).to.exist;
        const assessSpy = sinon.spy(examManagementService, 'assessUnsubmittedExamModelingAndTextParticipations');
        const assessButton = studentExamsComponentFixture.debugElement.query(By.css('#assessUnsubmittedExamModelingAndTextParticipationsButton'));
        expect(assessButton).to.exist;
        assessButton.nativeElement.click();
        expect(assessSpy).to.have.been.calledOnce;
    });
});