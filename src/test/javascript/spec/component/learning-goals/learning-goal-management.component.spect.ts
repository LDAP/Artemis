import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslatePipe } from '@ngx-translate/core';
import { MockComponent, MockDirective, MockPipe, MockProvider } from 'ng-mocks';
import { LearningGoalService } from 'app/course/learning-goals/learningGoal.service';
import { of } from 'rxjs';
import { LearningGoal } from 'app/entities/learningGoal.model';
import { LearningGoalManagementComponent } from 'app/course/learning-goals/learning-goal-management/learning-goal-management.component';
import { AlertComponent } from 'app/shared/alert/alert.component';
import { ActivatedRoute } from '@angular/router';
import { JhiAlertService } from 'ng-jhipster';
import { LearningGoalProgress, LectureUnitProgress } from 'app/course/learning-goals/learning-goal-progress-dtos.model';
import { Component, Input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DeleteButtonDirective } from 'app/shared/delete-dialog/delete-button.directive';
import { HasAnyAuthorityDirective } from 'app/shared/auth/has-any-authority.directive';
import { RouterTestingModule } from '@angular/router/testing';
import { TextUnit } from 'app/entities/lecture-unit/textUnit.model';
import { HttpResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';

chai.use(sinonChai);
const expect = chai.expect;

@Component({ selector: 'jhi-learning-goal-card', template: '<div><ng-content></ng-content></div>' })
class LearningGoalCardStubComponent {
    @Input() learningGoal: LearningGoal;
    @Input() learningGoalProgress: LearningGoalProgress;
}

describe('LearningGoalManagementComponent', () => {
    let learningGoalManagementComponentFixture: ComponentFixture<LearningGoalManagementComponent>;
    let learningGoalManagementComponent: LearningGoalManagementComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([])],
            declarations: [
                LearningGoalManagementComponent,
                LearningGoalCardStubComponent,
                MockPipe(TranslatePipe),
                MockComponent(AlertComponent),
                MockComponent(FaIconComponent),
                MockDirective(DeleteButtonDirective),
                MockDirective(HasAnyAuthorityDirective),
            ],
            providers: [
                MockProvider(JhiAlertService),
                MockProvider(LearningGoalService),
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({
                            courseId: 1,
                        }),
                    },
                },
            ],
            schemas: [],
        })
            .compileComponents()
            .then(() => {
                learningGoalManagementComponentFixture = TestBed.createComponent(LearningGoalManagementComponent);
                learningGoalManagementComponent = learningGoalManagementComponentFixture.componentInstance;
            });
    });

    afterEach(function () {
        sinon.restore();
    });

    it('should initialize', () => {
        learningGoalManagementComponentFixture.detectChanges();
        expect(learningGoalManagementComponent).to.be.ok;
    });

    it('should load learning goal and associated progress and display a card for each of them', () => {
        const learningGoalService = TestBed.inject(LearningGoalService);
        const learningGoal = new LearningGoal();
        const textUnit = new TextUnit();
        learningGoal.id = 1;
        learningGoal.description = 'test';
        learningGoal.lectureUnits = [textUnit];
        const learningUnitProgress = new LectureUnitProgress();
        learningUnitProgress.lectureUnitId = 1;
        learningUnitProgress.lectureId = 1;
        learningUnitProgress.pointsAchievedByStudentInLectureUnit = 5;
        learningUnitProgress.totalPointsAchievableByStudentsInLectureUnit = 10;
        const learningGoalProgress = new LearningGoalProgress();
        learningGoalProgress.learningGoalId = 1;
        learningGoalProgress.learningGoalTitle = 'test';
        learningGoalProgress.pointsAchievedByStudentInLearningGoal = 5;
        learningGoalProgress.totalPointsAchievableByStudentsInLearningGoal = 10;
        learningGoalProgress.progressInLectureUnits = [learningUnitProgress];

        const learningGoalsOfCourseResponse: HttpResponse<LearningGoal[]> = new HttpResponse({
            body: [learningGoal, new LearningGoal()],
            status: 200,
        });
        const learningGoalProgressResponse: HttpResponse<LearningGoalProgress> = new HttpResponse({
            body: learningGoalProgress,
            status: 200,
        });

        const getAllForCourseStub = sinon.stub(learningGoalService, 'getAllForCourse').returns(of(learningGoalsOfCourseResponse));
        const getProgressStub = sinon.stub(learningGoalService, 'getProgress').returns(of(learningGoalProgressResponse));

        learningGoalManagementComponentFixture.detectChanges();

        const learningGoalCards = learningGoalManagementComponentFixture.debugElement.queryAll(By.directive(LearningGoalCardStubComponent));
        expect(learningGoalCards).to.have.lengthOf(2);
        expect(getAllForCourseStub).to.have.been.calledOnce;
        expect(getProgressStub).to.have.been.calledTwice;
    });
});