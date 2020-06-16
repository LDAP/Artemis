import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { JhiEventManager } from 'ng-jhipster';
import { JhiEventWithContent } from 'ng-jhipster/service/event-with-content.model';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs';
import { ARTEMIS_DEFAULT_COLOR } from 'app/app.constants';
import { ExamManagementService } from 'app/exam/manage/exam-management.service';
import { Exam } from 'app/entities/exam.model';
import { onError } from 'app/shared/util/global.utils';
import { AlertService } from 'app/core/alert/alert.service';
import { Course } from 'app/entities/course.model';
import { CourseManagementService } from 'app/course/manage/course-management.service';
import { AccountService } from 'app/core/auth/account.service';

@Component({
    selector: 'jhi-exam-management',
    templateUrl: './exam-management.component.html',
    styleUrls: ['./exam-management.scss'],
})
export class ExamManagementComponent implements OnInit, OnDestroy {
    course: Course;
    exams: Exam[];
    isAtLeastInstructor = false;
    predicate: string;
    eventSubscriber: Subscription;
    private dialogErrorSource = new Subject<string>();
    dialogError$ = this.dialogErrorSource.asObservable();

    examListModificationDeleteEvent: JhiEventWithContent<string> = {
        name: 'examListModification',
        content: 'Deleted an exam',
    };
    readonly ARTEMIS_DEFAULT_COLOR = ARTEMIS_DEFAULT_COLOR;

    constructor(
        private route: ActivatedRoute,
        private courseService: CourseManagementService,
        private examManagementService: ExamManagementService,
        private eventManager: JhiEventManager,
        private accountService: AccountService,
        private jhiAlertService: AlertService,
    ) {
        this.predicate = 'id';
    }

    /**
     * Initialize the course and all exams when this view is initialised.
     * Subscribes to 'examListModification' event.
     * @see registerChangeInExams
     */
    ngOnInit(): void {
        this.courseService.find(Number(this.route.snapshot.paramMap.get('courseId'))).subscribe(
            (res: HttpResponse<Course>) => {
                this.course = res.body!;
                this.isAtLeastInstructor = this.accountService.isAtLeastInstructorInCourse(this.course);
                this.loadAllExamsForCourse();
                this.registerChangeInExams();
            },
            (res: HttpErrorResponse) => onError(this.jhiAlertService, res),
        );
    }

    /**
     * unsubscribe on component destruction
     */
    ngOnDestroy() {
        if (!this.eventSubscriber === undefined) {
            this.eventManager.destroy(this.eventSubscriber);
        }
        this.dialogErrorSource.unsubscribe();
    }

    /**
     * Load all exams for a course.
     */
    loadAllExamsForCourse() {
        this.examManagementService.findAllExamsForCourse(this.course.id).subscribe(
            (res: HttpResponse<Exam[]>) => {
                this.exams = res.body!;
            },
            (res: HttpErrorResponse) => onError(this.jhiAlertService, res),
        );
    }

    /**
     * Subscribes to 'examListModification' events
     */
    registerChangeInExams() {
        this.eventSubscriber = this.eventManager.subscribe('examListModification', () => {
            this.loadAllExamsForCourse();
        });
    }

    /**
     * Function is called when the delete button is pressed for an exam
     * @fires examListModificationDeleteEvent
     * @param examId Id to be deleted
     */
    deleteExam(examId: number) {
        this.examManagementService.delete(this.course.id, examId).subscribe(
            () => {
                this.eventManager.broadcast(this.examListModificationDeleteEvent);
                this.dialogErrorSource.next('');
            },
            (error: HttpErrorResponse) => this.dialogErrorSource.next(error.message),
        );
    }

    /**
     * Track the items on the Exams Table
     * @param index {number}
     * @param item {Exam}
     */
    trackId(index: number, item: Exam) {
        return item.id;
    }
}